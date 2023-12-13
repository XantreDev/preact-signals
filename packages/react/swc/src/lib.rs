#![feature(box_patterns, let_chains, if_let_guard, slice_take)]

mod utils;
use utils::*;

use std::fmt::Debug;

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
        visit::{
            as_folder, noop_visit_mut_type, FoldWith, Visit, VisitMut, VisitMutWith, VisitWith,
        },
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
pub extern crate swc_core;

/// Test transformation.
#[macro_export]
macro_rules! test {
    (ignore, $syntax:expr, $tr:expr, $test_name:ident, $input:expr, $expected:expr) => {
        #[test]
        #[ignore]
        fn $test_name() {
            $crate::swc_core::ecma::transforms::testing::test_transform(
                $syntax, $tr, $input, $expected, false,
            )
        }
    };

    ($syntax:expr, $tr:expr, $test_name:ident, $input:expr, $expected:expr) => {
        #[test]
        fn $test_name() {
            $crate::swc_core::ecma::transforms::testing::test_transform(
                $syntax, $tr, $input, $expected, false,
            )
        }
    };

    ($syntax:expr, $tr:expr, $test_name:ident, $input:expr, $expected:expr, ok_if_code_eq) => {
        #[test]
        fn $test_name() {
            $crate::swc_core::ecma::transforms::testing::test_transform(
                $syntax, $tr, $input, $expected, true,
            )
        }
    };
}

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
        }
    }
    fn from_default(comments: C) -> Self {
        SignalsTransformVisitor {
            comments: comments,
            mode: TransformMode::All,
            import_use_signals: None,
            use_signals_import_source: get_default_import_source(),
        }
    }
}

fn wrap_with_use_signals(n: &Vec<Stmt>, use_signals_ident: Ident) -> Vec<Stmt> {
    let mut new_stmts = Vec::new();
    let signal_effect_ident = private_ident!("_effect");
    new_stmts.push(Stmt::Decl(Decl::Var(Box::new(VarDecl {
        span: DUMMY_SP,
        kind: VarDeclKind::Var,
        declare: false,
        decls: vec![VarDeclarator {
            definite: false,
            span: DUMMY_SP,
            init: Some(Box::new(Expr::Call(CallExpr {
                span: DUMMY_SP,
                callee: Callee::Expr(Box::new(Expr::Ident(use_signals_ident))),
                args: vec![],
                type_args: None,
            }))),
            name: Pat::Ident(BindingIdent {
                id: signal_effect_ident.clone(),
                type_ann: None,
            }),
        }],
    }))));
    new_stmts.push(Stmt::Try(Box::new(TryStmt {
        span: DUMMY_SP,
        block: BlockStmt {
            span: DUMMY_SP,
            stmts: n.to_vec(),
        },
        handler: None,
        finalizer: Some(BlockStmt {
            span: DUMMY_SP,
            stmts: vec![Stmt::Expr(ExprStmt {
                span: DUMMY_SP,
                expr: Box::new(Expr::Call(CallExpr {
                    args: vec![],
                    span: DUMMY_SP,
                    type_args: None,
                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: DUMMY_SP,
                        prop: MemberProp::Ident(Ident {
                            span: DUMMY_SP,
                            sym: Atom::from("f"),
                            optional: false,
                        }),
                        obj: Box::new(Expr::Ident(signal_effect_ident)),
                    }))),
                })),
            })],
        }),
    })));

    new_stmts
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
            println!("{:?}", item);
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
                    panic!("Cannot have both @trackSignals and @noTrackSignals")
                }
                (_, true) => ShouldTrack::OptOut,
                (true, false) => ShouldTrack::OptIn,
                _ => ShouldTrack::Auto,
            }
        }
        None => ShouldTrack::Auto,
    }
}
fn should_track_by_comments<C>(comments: &C, spans: Vec<&Option<Span>>) -> ShouldTrack
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

fn should_track_auto<I, Comp>(mode: &TransformMode, ident: &I, component: &Comp) -> bool
where
    Comp: Detectable,
    I: MaybeComponentName,
{
    match mode {
        TransformMode::All => ident.is_component_name() && component.has_jsx(),
        TransformMode::Manual => false,
        TransformMode::Auto => {
            ident.is_component_name() && component.has_jsx() && component.has_dot_value()
        }
    }
}
impl<C> VisitMut for SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    noop_visit_mut_type!();

    fn visit_mut_var_decl(&mut self, n: &mut VarDecl) {
        if let Some(first) = n.decls.as_mut_slice().take_first_mut()
            && let Some(init) = &mut first.init
            && let child_span = init.unwrap_parens().get_span().clone()
            && let Some(component) = extract_fn_from_expr(init.unwrap_parens_mut())
            && match should_track_by_comments(
                &self.comments,
                vec![&Some(child_span), &Some(n.span)],
            ) {
                ShouldTrack::Auto => should_track_auto(&self.mode, &first.name, &component),
                ShouldTrack::OptIn => true,
                ShouldTrack::OptOut => false,
            }
        {
            match component {
                FunctionLike::Arrow(arrow_expr) => {
                    let mut block = arrow_expr.body.to_block();
                    let wrapped_body =
                        wrap_with_use_signals(&block.stmts, self.get_import_use_signals());
                    block.stmts = wrapped_body;
                    arrow_expr.body = Box::new(BlockStmtOrExpr::BlockStmt(block.to_owned()));
                }
                FunctionLike::Fn(fn_expr) => {
                    if let Some(block_stmt) = &mut fn_expr.function.body {
                        block_stmt.stmts =
                            wrap_with_use_signals(&block_stmt.stmts, self.get_import_use_signals());
                    }
                }
            }
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_fn_decl(&mut self, n: &mut FnDecl) {
        if match should_track_by_comment(&self.comments, &n.function.span) {
            ShouldTrack::Auto => should_track_auto(&self.mode, &n.ident, n),
            ShouldTrack::OptIn => true,
            ShouldTrack::OptOut => false,
        } && let Some(block_stmt) = &mut n.function.body
        {
            block_stmt.stmts =
                wrap_with_use_signals(&block_stmt.stmts, self.get_import_use_signals());
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
"#
);
