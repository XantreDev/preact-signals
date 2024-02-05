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
use std::path::PathBuf;
use swc_core::{
    common::comments::Comments,
    common::{comments::CommentKind, sync::Lazy, Span, DUMMY_SP},
    ecma::{
        ast::*,
        atoms::Atom,
        utils::{prepend_stmt, private_ident},
        visit::{as_folder, noop_visit_mut_type, FoldWith, VisitMut, VisitMutWith},
    },
    plugin::{
        metadata::TransformPluginMetadataContextKind, plugin_transform,
        proxies::TransformPluginProgramMetadata,
    },
};

fn get_import_source(str: &str) -> Str {
    Str {
        span: DUMMY_SP,
        value: Atom::new(str),
        raw: None,
    }
}
fn is_track_signals_directive(string: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#"\s@useSignals\s"#).unwrap());

    RE.is_match(string)
}
fn is_no_track_signals_directive(string: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#"\s@noUseSignals\s"#).unwrap());

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
    is_file_named_like_component: bool,
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
    fn from_options(
        options: PreactSignalsPluginOptions,
        comments: C,
        is_file_named_like_component: bool,
    ) -> Self {
        SignalsTransformVisitor {
            comments: comments,
            is_file_named_like_component,
            mode: options.mode.unwrap_or(TransformMode::All),
            import_use_signals: None,
            use_signals_import_source: options
                .import_source
                .map(|it| get_import_source(it.as_str()))
                .unwrap_or(get_default_import_source()),
            ignore_span: None,
        }
    }
    fn from_default(comments: C, is_file_named_like_component: bool) -> Self {
        SignalsTransformVisitor {
            comments: comments,
            is_file_named_like_component,
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
            && let defaults_spans = [Some(child_span), Some(n.span)]
            && let spans = [additional_spans.unwrap_or(&[]), &defaults_spans].concat()
            && match component.get_fn_ident() {
                None => self.should_track(&spans, &first.name, &component, false),
                Some(ident) => self.should_track(&spans, &ident, &component, false),
            }
        {
            transform(self, &mut component)
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
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
                    // println!("component uses both @useSignals and @noUseSignals at the same time, ignoring @useSignals");
                    ShouldTrack::OptOut
                }
                (true, false) => ShouldTrack::OptIn,
                (false, true) => ShouldTrack::OptOut,
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
        .filter_map(|it| match it {
            Some(span) => match should_track_by_comment(comments, span) {
                ShouldTrack::Auto => None,
                it => Some(it),
            },
            None => None,
        })
        .reduce(|acc, it| match (acc, it) {
            (ShouldTrack::OptIn, ShouldTrack::OptOut) => ShouldTrack::OptOut,
            (ShouldTrack::OptOut, ShouldTrack::OptIn) => ShouldTrack::OptOut,
            (_, it) => it,
        })
        .unwrap_or(ShouldTrack::Auto)
}

impl<C> SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    fn should_track_auto<I, Comp>(
        &self,
        ident: Option<&I>,
        component: &Comp,
        is_default_export: bool,
    ) -> bool
    where
        Comp: Detectable,
        I: MaybeComponentName,
    {
        let should_track_by_name = || {
            if is_default_export && ident.is_none() {
                self.is_file_named_like_component
            } else {
                ident.map(|it| it.is_component_name()).unwrap_or(false)
            }
        };
        match self.mode {
            TransformMode::All => should_track_by_name() && component.has_jsx(),
            TransformMode::Manual => false,
            TransformMode::Auto => {
                should_track_by_name() && component.has_jsx() && component.has_dot_value()
            }
        }
    }

    #[inline]
    fn should_track_option_ident<I, Comp>(
        &self,
        comment_spans: &[Option<Span>],
        ident: Option<&I>,
        component: &Comp,
        is_default_export: bool,
    ) -> bool
    where
        Comp: Detectable,
        I: MaybeComponentName,
    {
        match should_track_by_comments(&self.comments, comment_spans) {
            ShouldTrack::Auto => self.should_track_auto(ident, component, is_default_export),
            ShouldTrack::OptIn => true,
            ShouldTrack::OptOut => false,
        }
    }
    fn should_track<I, Comp>(
        &self,
        comment_spans: &[Option<Span>],
        ident: &I,
        component: &Comp,
        is_default_export: bool,
    ) -> bool
    where
        Comp: Detectable,
        I: MaybeComponentName,
    {
        self.should_track_option_ident(comment_spans, Some(ident), component, is_default_export)
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
                self.ignore_span = Some(var_decl.span.clone());
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
                    false,
                ) {
                    fn_declr
                        .function
                        .wrap_with_use_signals(self.get_import_use_signals())
                }
                let old_span = self.ignore_span;
                self.ignore_span = Some(fn_declr.function.span.clone());
                n.visit_mut_children_with(self);
                self.ignore_span = old_span
            }
            n => n.visit_mut_children_with(self),
        }
    }
    fn visit_mut_export_default_decl(&mut self, n: &mut ExportDefaultDecl) {
        match n {
            ExportDefaultDecl {
                span,
                decl: DefaultDecl::Fn(ref mut fn_expr),
            } => {
                if self.should_track_option_ident(
                    &[Some(span.clone()), Some(fn_expr.function.span)],
                    fn_expr.ident.as_ref(),
                    fn_expr,
                    true,
                ) {
                    fn_expr
                        .function
                        .wrap_with_use_signals(self.get_import_use_signals())
                }
                let old_span = self.ignore_span;
                self.ignore_span = Some(fn_expr.function.span.clone());
                n.visit_mut_children_with(self);
                self.ignore_span = old_span
            }
            n => n.visit_mut_children_with(self),
        }
    }
    fn visit_mut_export_default_expr(&mut self, n: &mut ExportDefaultExpr) {
        match n {
            ExportDefaultExpr { span, ref mut expr } => {
                let child_span = expr.unwrap_parens().get_span().clone();
                if let Some(mut component) = extract_fn_from_expr(expr.unwrap_parens_mut())
                    && let spans = [Some(span.clone()), Some(child_span), Some(n.span)]
                    && self.should_track_option_ident(
                        &spans,
                        component.get_fn_ident().as_ref(),
                        &component,
                        true,
                    )
                {
                    component.wrap_with_use_signals(self.get_import_use_signals());
                }

                n.visit_mut_children_with(self);
                // let old_span = self.ignore_span;
                // self.ignore_span = Some(child_span);
                // self.ignore_span = old_span
            }
        }
    }
    fn visit_mut_fn_decl(&mut self, n: &mut FnDecl) {
        if match self.ignore_span {
            Some(span) => !span.eq(&n.function.span),
            None => true,
        } && self.should_track(&[Some(n.function.span)], &n.ident, n, false)
        {
            n.function
                .wrap_with_use_signals(self.get_import_use_signals())
        }
        n.visit_mut_children_with(self);
    }

    fn visit_mut_assign_expr(&mut self, n: &mut AssignExpr) {
        if let Some(mut component) = extract_fn_from_expr(n.right.borrow_mut())
            && match component.get_fn_ident() {
                None => self.should_track(&[Some(n.span)], &n.left, &component, false),
                Some(ident) => self.should_track(&[Some(n.span)], &ident, &component, false),
            }
        {
            component.wrap_with_use_signals(self.get_import_use_signals())
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_key_value_prop(&mut self, n: &mut KeyValueProp) {
        if let Some(mut component) = extract_fn_from_expr(&mut n.value)
            && self.should_track(
                &[Some(*n.key.get_span())],
                &component
                    .get_fn_ident()
                    .map_or(n.key.clone(), |it| PropName::Ident(it)),
                &component,
                false,
            )
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
            false,
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
            prepend_stmt(
                &mut n.body,
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

        let is_file_named_like_component = _metadata
            .get_context(&TransformPluginMetadataContextKind::Filename)
            .map(|it| {
                PathBuf::from(it)
                    .file_name()
                    .map(|it| it.to_str())
                    .flatten()
                    .map(|it| it.to_owned())
            })
            .flatten()
            .map(|it| it.is_component_name())
            .unwrap_or(false);

        match data {
            Some(data) => {
                let options = serde_json::from_str::<PreactSignalsPluginOptions>(data.as_str())
                    .expect("transform plugin config should be valid json");
                SignalsTransformVisitor::from_options(
                    options,
                    _metadata.comments,
                    is_file_named_like_component,
                )
            }
            None => SignalsTransformVisitor::from_default(
                _metadata.comments,
                is_file_named_like_component,
            ),
        }
    }))
}

#[cfg(test)]
fn get_syntax() -> Syntax {
    let mut a = EsConfig::default();
    a.jsx = true;
    Syntax::Es(a)
}

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    arrow_fn,
    // Input codes
    r#"
const A = () => {
    return <div />
}
const Cecek = () => <div />
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
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    function,
    // Input codes
    r#"
// should be transformed
function A(){
    return <div />
}
"#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
function A() {
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
}
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    function_expr,
    // Input codes
    r#"
var C = function(){
    return <div />
};
var C2 = function C3(){
    return <div />
};
"#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
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
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    opt_in,
    // Input codes
    r#"
/**
 * @useSignals
 */
function a(){
    return 10;
}

/**
 * @useSignals
 */
const b = () => {
    return 10;
}

/**
 * @useSignals
 */
const c = function(){
    return 10
};
/**
 * @useSignals
 */
const d = () => 10

/**
 * @useSignals
 */
export function boba(){
    return 10
}

/**
 * @useSignals
 */
export const boba2 = () => 10
"#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";

function a() {
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
}
const b = ()=>{
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
const c = function() {
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
const d = ()=>{
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};

export function boba() {
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
}
export const boba2 = ()=>{
    var _effect = _useSignals();
    try {
        return 10;
    } finally{
        _effect.f();
    }
};
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    nested_components,
    // Input codes
    r#"
function Asdjsadf(){
    /**
     * @useSignals
     */
    function B(){
        return <div />
    };
    /**
     * @useSignals
     */
    function c(){
        return 5
    };

    return <div />
}
"#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
function Asdjsadf() {
    var _effect = _useSignals();
    try {
        function B() {
            var _effect = _useSignals();
            try {
                return <div/>;
            } finally{
                _effect.f();
            }
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
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    hocs,
    // Input codes
    r#"
const Cec = memo(() => {
    return <div />
})
// hocs should be transformed
const Cyc = React.lazy(React.memo(() => {
    return <div />
}), {})
"#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
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
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    opt_in_opt_out,
    // Input codes
    r#"
/**
 * @noUseSignals
 * @useSignals
 */
function MyComponent() {
    return <div>{signal.value}</div>;
}
"#,
    // Expected codes
    r#"
/**
 * @noUseSignals
 * @useSignals
 */
function MyComponent() {
    return <div>{signal.value}</div>;
}
"#
);

// An example to test plugin transform.
// Recommended strategy to test plugin's transform is verify
// the Visitor's behavior, instead of trying to run `process_transform` with mocks
// unless explicitly required to do so.
test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    rare_components,
    // Input codes
    r#"
let Jopa;
Jopa = () => <>{a.value}</>
Jopa = function(){
    return <>{a.value}</>
}
const A = {
    Beb(){
        return <>10</>
    }
}

A.bebe.Baba = () => <div>{a.value}</div>

const Beb = {
    A: () => <div />
}

const _ = {
    ['Aboba']() {
        return <div />        
    }
}
    "#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";

let Jopa;
Jopa = ()=>{
    var _effect = _useSignals();
    try {
        return <>{a.value}</>;
    } finally{
        _effect.f();
    }
};
Jopa = function() {
    var _effect = _useSignals();
    try {
        return <>{a.value}</>;
    } finally{
        _effect.f();
    }
};
const A = {
    Beb() {
        var _effect = _useSignals();
        try {
            return <>10</>;
        } finally{
            _effect.f();
        }
    }
};
A.bebe.Baba = ()=>{
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

const _ = {
    ['Aboba']() {
        var _effect = _useSignals();
        try {
            return <div/>;
        } finally{
            _effect.f();
        }
    }
}
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        true
    )),
    default_components,
    // Input codes
    r#"
export default function(){
    return <div />
}
export default (() => {
    return <div />
})
"#,
    // Expected codes
    r#"
import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
export default function() {
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
}

export default (()=>{
    var _effect = _useSignals();
    try {
        return <div/>;
    } finally{
        _effect.f();
    }
});
"#
);

test!(
    get_syntax(),
    |tester| as_folder(SignalsTransformVisitor::from_default(
        tester.comments.clone(),
        false
    )),
    import_goes_after_directives,
    // Input codes
    r#"
'use strict';

const Bebe = () => <div>{a.value}</div>
"#,
    // Expected codes
    r#"
'use strict';

import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
const Bebe = ()=>{
    var _effect = _useSignals();
    try {
        return <div>{a.value}</div>;
    } finally{
        _effect.f();
    }
}
"#
);
