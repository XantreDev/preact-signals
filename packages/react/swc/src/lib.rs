#![feature(box_patterns, let_chains, if_let_guard, slice_take)]

mod utils;
use utils::*;
mod test;
use test::test;

use std::{
    borrow::BorrowMut,
    fmt::Debug,
    ops::{Deref, DerefMut},
};

use regex::Regex;
use serde::Deserialize;
use serde_json;
use swc_core::{
    common::comments::Comments,
    common::{comments::CommentKind, sync::Lazy, Span, DUMMY_SP},
    ecma::{
        ast::*,
        atoms::Atom,
        parser::{EsConfig, Syntax},
        utils::{prepend_stmt, private_ident},
        visit::{as_folder, noop_visit_mut_type, FoldWith, VisitMut, VisitMutWith},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};

fn get_import_source(str: &str) -> Str {
    Str {
        span: DUMMY_SP,
        value: Atom::new(str),
        raw: None,
    }
}
fn is_track_signals_directive(string: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#"\s@trackSignals\s"#).unwrap());

    RE.is_match(string)
}
fn is_no_track_signals_directive(string: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#"\s@noTrackSignals\s"#).unwrap());

    RE.is_match(string)
}
fn get_default_import_source() -> Str {
    get_import_source("@preact-signals/safe-react/tracking")
}
fn get_named_import_ident() -> Ident {
    Ident {
        span: DUMMY_SP,
        sym: "useSignals".into(),
        optional: false,
    }
}

#[derive(PartialEq, Eq, Deserialize)]
#[serde(rename_all = "kebab-case")]
enum TransformMode {
    Manual,
    All,
    Auto,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PreactSignalsPluginOptions {
    mode: Option<TransformMode>,
    import_source: Option<String>,
}

pub struct SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    comments: C,
    mode: TransformMode,
    import_use_signals: Option<Ident>,
    use_signals_import_source: Str,
    ignore_span: Option<Span>,
}

impl<C> SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    fn get_import_use_signals(&mut self) -> Ident {
        self.import_use_signals
            .get_or_insert(private_ident!("_useSignals"))
            .clone()
    }
    fn from_options(options: PreactSignalsPluginOptions, comments: C) -> Self {
        SignalsTransformVisitor {
            comments: comments,
            mode: options.mode.unwrap_or(TransformMode::All),
            import_use_signals: None,
            use_signals_import_source: options
                .import_source
                .map(|it| get_import_source(it.as_str()))
                .unwrap_or(get_default_import_source()),
            ignore_span: None,
        }
    }
    fn from_default(comments: C) -> Self {
        SignalsTransformVisitor {
            comments: comments,
            mode: TransformMode::All,
            import_use_signals: None,
            use_signals_import_source: get_default_import_source(),
            ignore_span: None,
        }
    }

    fn process_var_decl<T>(
        &mut self,
        n: &mut VarDecl,
        additional_spans: Option<&[Option<Span>]>,
        transform: T,
    ) where
        T: FnOnce(&mut SignalsTransformVisitor<C>, &mut FunctionLike),
    {
        if let Some(first) = n.decls.as_mut_slice().take_first_mut()
            && let Some(init) = &mut first.init
            && let child_span = init.unwrap_parens().get_span().clone()
            && let Some(mut component) = extract_fn_from_expr(init.unwrap_parens_mut())
            && let spans = [
                additional_spans.unwrap_or(&[]),
                &[Some(child_span), Some(n.span)],
            ]
            .concat()
            && match component.get_fn_ident() {
                None => self.should_track(&spans, &first.name, &component),
                Some(ident) => self.should_track(&spans, &ident, &component),
            }
        {
            transform(self, &mut component)
        }
    }
}

#[derive(Debug)]
enum ShouldTrack {
    OptIn,
    OptOut,
    Auto,
}

fn should_track_by_comment<C>(comments: &C, span: &Span) -> ShouldTrack
where
    C: Comments + Debug,
{
    match comments.get_leading(span.lo) {
        Some(item) => {
            let is_track_signals = item
                .iter()
                .find(|it| {
                    it.kind == CommentKind::Block && is_track_signals_directive(it.text.as_str())
                })
                .is_some();
            let is_no_track_signals = item
                .iter()
                .find(|it| {
                    it.kind == CommentKind::Block && is_no_track_signals_directive(it.text.as_str())
                })
                .is_some();

            match (is_track_signals, is_no_track_signals) {
                (true, true) => {
                    // TODO: warn
                    // println!("component uses both @trackSignals and @noTrackSignals at the same time, ignoring @trackSignals");
                    ShouldTrack::OptOut
                }
                (_, true) => ShouldTrack::OptOut,
                (true, false) => ShouldTrack::OptIn,
                _ => ShouldTrack::Auto,
            }
        }
        None => ShouldTrack::Auto,
    }
}
fn should_track_by_comments<C>(comments: &C, spans: &[Option<Span>]) -> ShouldTrack
where
    C: Comments + Debug,
{
    spans
        .into_iter()
        .map(|it| match it {
            Some(span) => should_track_by_comment(comments, span),
            None => ShouldTrack::Auto,
        })
        .find(|it| match it {
            ShouldTrack::OptIn => true,
            ShouldTrack::OptOut => true,
            _ => false,
        })
        .unwrap_or(ShouldTrack::Auto)
}

impl<C> SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    fn should_track_auto<I, Comp>(&self, ident: &I, component: &Comp) -> bool
    where
        Comp: Detectable,
        I: MaybeComponentName,
    {
        match self.mode {
            TransformMode::All => ident.is_component_name() && component.has_jsx(),
            TransformMode::Manual => false,
            TransformMode::Auto => {
                ident.is_component_name() && component.has_jsx() && component.has_dot_value()
            }
        }
    }

    fn should_track<I, Comp>(
        &self,
        comment_spans: &[Option<Span>],
        ident: &I,
        component: &Comp,
    ) -> bool
    where
        Comp: Detectable,
        I: MaybeComponentName,
    {
        match should_track_by_comments(&self.comments, comment_spans) {
            ShouldTrack::Auto => self.should_track_auto(ident, component),
            ShouldTrack::OptIn => true,
            ShouldTrack::OptOut => false,
        }
    }
}
impl<C> VisitMut for SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    noop_visit_mut_type!();

    fn visit_mut_var_decl(&mut self, n: &mut VarDecl) {
        let should_process = self
            .ignore_span
            .map(|span| !span.eq(&n.span))
            .unwrap_or(true);

        if should_process {
            self.process_var_decl(n, None, |mut_self, it| {
                it.wrap_with_use_signals(mut_self.get_import_use_signals())
            })
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_export_decl(&mut self, n: &mut ExportDecl) {
        match n {
            ExportDecl {
                span,
                decl: Decl::Var(ref mut var_decl),
            } => {
                self.process_var_decl(
                    var_decl.deref_mut(),
                    Some(&[Some(*span)]),
                    |mut_self, it| it.wrap_with_use_signals(mut_self.get_import_use_signals()),
                );
                let old_span = self.ignore_span;
                self.ignore_span = Some(span.clone());
                n.visit_mut_children_with(self);
                self.ignore_span = old_span
            }
            ExportDecl {
                span,
                decl: Decl::Fn(ref mut fn_declr),
            } => {
                if self.should_track(
                    &[Some(span.clone()), Some(fn_declr.function.span)],
                    &fn_declr.ident,
                    fn_declr,
                ) {
                    fn_declr
                        .function
                        .wrap_with_use_signals(self.get_import_use_signals())
                }
                let old_span = self.ignore_span;
                self.ignore_span = Some(span.clone());
                n.visit_mut_children_with(self);
                self.ignore_span = old_span
            }
            n => n.visit_mut_children_with(self),
        }
    }
    fn visit_mut_fn_decl(&mut self, n: &mut FnDecl) {
        if self.should_track(&[Some(n.function.span)], &n.ident, n) {
            n.function
                .wrap_with_use_signals(self.get_import_use_signals())
        }
        n.visit_mut_children_with(self);
    }

    fn visit_mut_assign_expr(&mut self, n: &mut AssignExpr) {
        if let Some(mut component) = extract_fn_from_expr(n.right.borrow_mut())
            && match component.get_fn_ident() {
                None => self.should_track(&[Some(n.span)], &n.left, &component),
                Some(ident) => self.should_track(&[Some(n.span)], &ident, &component),
            }
        {
            component.wrap_with_use_signals(self.get_import_use_signals())
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_key_value_prop(&mut self, n: &mut KeyValueProp) {
        if let Some(mut component) = extract_fn_from_expr(&mut n.value)
            && self.should_track(&[Some(*n.key.get_span())], &n.key, &component)
        {
            component.wrap_with_use_signals(self.get_import_use_signals())
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_method_prop(&mut self, n: &mut MethodProp) {
        if self.should_track(
            &[n.function.span.into(), n.key.get_span().clone().into()],
            &n.key,
            n.function.deref(),
        ) {
            n.function
                .wrap_with_use_signals(self.get_import_use_signals())
        }

        n.visit_mut_children_with(self);
    }

    fn visit_mut_module(&mut self, n: &mut Module) {
        self.import_use_signals = None;
        n.visit_mut_children_with(self);
        if let Some(ident) = &self.import_use_signals {
            n.body.insert(
                0,
                ModuleItem::ModuleDecl(
                    add_import(
                        ident.clone(),
                        self.use_signals_import_source.clone(),
                        get_named_import_ident().into(),
                    )
                    .into(),
                ),
            )
        }
    }

    fn visit_mut_script(&mut self, n: &mut Script) {
        self.import_use_signals = None;
        n.visit_mut_children_with(self);

        if let Some(ident) = &self.import_use_signals {
            prepend_stmt(
                &mut n.body,
                add_require(
                    ident.clone(),
                    self.use_signals_import_source.clone(),
                    get_named_import_ident().into(),
                ),
            )
        }
    }
}

/// An example plugin function with macro support.
/// `plugin_transform` macro interop pointers into deserialized structs, as well
/// as returning ptr back to host.
///
/// It is possible to opt out from macro by writing transform fn manually
/// if plugin need to handle low-level ptr directly via
/// `__transform_plugin_process_impl(
///     ast_ptr: *const u8, ast_ptr_len: i32,
///     unresolved_mark: u32, should_enable_comments_proxy: i32) ->
///     i32 /*  0 for success, fail otherwise.
///             Note this is only for internal pointer interop result,
///             not actual transform result */`
///
/// This requires manual handling of serialization / deserialization from ptrs.
/// Refer swc_plugin_macro to see how does it work internally.
#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder({
        let data = _metadata.get_transform_plugin_config();

        match data {
            Some(data) => {
                let options = serde_json::from_str::<PreactSignalsPluginOptions>(data.as_str())
                    .expect("transform plugin config should be valid json");
                SignalsTransformVisitor::from_options(options, _metadata.comments)
            }
            None => SignalsTransformVisitor::from_default(_metadata.comments),
        }
    }))
}

#[cfg(test)]
fn get_syntax() -> Syntax {
    let mut a = EsConfig::default();
    a.jsx = true;
    Syntax::Es(a)
}

// An example to test plugin transform.
// Recommended strategy to test plugin's transform is verify
// the Visitor's behavior, instead of trying to run `process_transform` with mocks
// unless explicitly required to do so.
test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone()
    )),
    boo,
    // Input codes
    r#"
// should be transformed
const A = () => {
    return <div />
}
// should be transformed
const Cecek = () => <div />

// should be transformed
function Beb2(){
    return <div />
}
var C = function(){
    return <div />
};
var C2 = function C3(){
    return <div />
};

/**
 * should be transformed
 * @trackSignals
 */
const sdfj = () => 1

// should be transformed
const inlineComment = /** @trackSignals */ () => 1

// hocs should be transformed
const Cec = memo(() => {
    return <div />
})
// hocs should be transformed
const Cyc = React.lazy(React.memo(() => {
    return <div />
}), {})

// should not be transformed
const CycPlain = () => 5

/**
 * should not be transformed
 * @noTrackSignals
 */
function B(){
    return <div />
};

function Asdjsadf(){
    /**
     * shouldn't be transformed
     * @noTrackSignals
     */
    function B(){
        return <div />
    };
    /**
     * should be transformed
     * @trackSignals
     */
    function c(){
        return 5
    };

    return <div />
}
let Jopa;
Jopa = () => <>{a.value}</>

a.bebe.Baba = () => <div>{a.value}</div>

const Beb = {
    A: () => <div />
}

/**
 * @trackSignals
 */
export function bebe() {}

const A = function app() {
    return <div>{sig.value}</div>
}

const A = {
    Beb(){
        return <>10</>
    }
}

    "#,
    // Expected codes
    r#"
    import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
    const A = ()=>{
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    };
    const Cecek = ()=>{
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    };
    function Beb2() {
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    }
    var C = function() {
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    };
    var C2 = function C3() {
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    };
    const sdfj = ()=>{
        var _effect = _useSignals();
        try {
            return 1;
        } finally{
            _effect.f();
        }
    };
    const inlineComment = ()=>{
        var _effect = _useSignals();
        try {
            return 1;
        } finally{
            _effect.f();
        }
    };
    const Cec = memo(()=>{
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    });
    const Cyc = React.lazy(React.memo(()=>{
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    }), {});
    const CycPlain = ()=>5;
    function B() {
        return <div/>;
    }
    ;
    function Asdjsadf() {
        var _effect = _useSignals();
        try {
            function B() {
                return <div/>;
            }
            ;
            function c() {
                var _effect = _useSignals();
                try {
                    return 5;
                } finally{
                    _effect.f();
                }
            }
            ;
            return <div/>;
        } finally{
            _effect.f();
        }
    }
    let Jopa;
    Jopa = ()=>{
        var _effect = _useSignals();
        try {
            return <>{a.value}</>;
        } finally{
            _effect.f();
        }
    };
    a.bebe.Baba = ()=>{
        var _effect = _useSignals();
        try {
            return <div>{a.value}</div>;
        } finally{
            _effect.f();
        }
    };
    const Beb = {
        A: ()=>{
            var _effect = _useSignals();
            try {
                return <div/>;
            } finally{
                _effect.f();
            }
        }
    };
    export function bebe() {
        var _effect = _useSignals();
        try {} finally{
            _effect.f();
        }
    }
    const A = function app() {
        return <div>{sig.value}</div>;
    };
    const A = {
        Beb () {
            var _effect = _useSignals();
            try {
                return <>10</>;
            } finally{
                _effect.f();
            }
        }
    };
"#
);
