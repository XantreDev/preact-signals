#![feature(box_patterns, let_chains, if_let_guard, slice_take)]

use regex::Regex;
use swc_core::{
    common::comments::Comments,
    common::{sync::Lazy, DUMMY_SP},
    ecma::{
        ast::*,
        atoms::Atom,
        parser::{EsConfig, Syntax},
        utils::{prepend_stmt, private_ident},
        visit::{
            as_folder, noop_visit_mut_type, FoldWith, Visit, VisitMut, VisitMutWith, VisitWith,
        },
    },
    plugin::{
        plugin_transform,
        proxies::{PluginCommentsProxy, TransformPluginProgramMetadata},
    },
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
// fn get_default_import_specifier() -> ImportSpecifier {
//     ImportSpecifier::Default(ImportDefaultSpecifier {
//         span: DUMMY_SP,
//         local: get_named_import_ident(),
//     })
// }

enum TransformMode {
    Auto,
    Manual,
    All,
}

pub struct TransformVisitor<C>
where
    C: Comments,
{
    comments: C,
    mode: TransformMode,
    import_use_signals: Option<Ident>,
    use_signals_import_source: Str,
}

impl<C> TransformVisitor<C>
where
    C: Comments,
{
    fn get_import_use_signals(&mut self) -> Ident {
        self.import_use_signals
            .get_or_insert(private_ident!("_useSignals"))
            .clone()
    }
}

fn is_component_name(name: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new("^[A-Z]").unwrap());
    RE.is_match(name)
}

trait MaybeComponentName {
    fn is_component_name(&self) -> bool;
}

impl MaybeComponentName for Ident {
    fn is_component_name(&self) -> bool {
        is_component_name(self.sym.as_str())
    }
}
impl MaybeComponentName for BindingIdent {
    fn is_component_name(&self) -> bool {
        self.id.is_component_name()
    }
}
impl MaybeComponentName for Pat {
    fn is_component_name(&self) -> bool {
        if let Pat::Ident(id) = self {
            return id.is_component_name();
        }
        false
    }
}

trait FunctionLikeExpr {
    fn is_regular(&self) -> bool;
}

impl FunctionLikeExpr for ArrowExpr {
    fn is_regular(&self) -> bool {
        !self.is_async && !self.is_generator
    }
}
impl FunctionLikeExpr for FnExpr {
    fn is_regular(&self) -> bool {
        self.function.is_regular()
    }
}
impl FunctionLikeExpr for Function {
    fn is_regular(&self) -> bool {
        !self.is_async && !self.is_generator
    }
}
impl FunctionLikeExpr for FnDecl {
    fn is_regular(&self) -> bool {
        self.function.is_regular()
    }
}

fn wrap_with_use_signals(n: &Vec<Stmt>, use_signals_ident: Ident) -> Vec<Stmt> {
    let mut new_stmts = Vec::new();
    let signal_effect_ident = Ident {
        span: DUMMY_SP,
        sym: Atom::from("_s"),
        optional: false,
    };
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

enum FunctionLike<'a> {
    Arrow(&'a mut ArrowExpr),
    Fn(&'a mut FnExpr),
}

fn extract_fn_from_expr<'a>(expr: &'a mut Expr) -> Option<FunctionLike<'a>> {
    match expr {
        Expr::Fn(fn_expr) if fn_expr.is_regular() => Some(FunctionLike::Fn(fn_expr)),
        Expr::Arrow(arrow_expr) if arrow_expr.is_regular() => Some(FunctionLike::Arrow(arrow_expr)),
        Expr::Call(CallExpr {
            args,
            span: _,
            type_args: _,
            callee: _,
        }) => {
            if let Some(ExprOrSpread {
                spread: None,
                expr: first_arg_expr,
            }) = args.as_mut_slice().take_first_mut()
            {
                extract_fn_from_expr(first_arg_expr.unwrap_parens_mut())
            } else {
                None
            }
        }
        _ => None,
    }
}

trait Blockable {
    fn to_block(&mut self) -> BlockStmt;
}
impl Blockable for BlockStmtOrExpr {
    fn to_block(&mut self) -> BlockStmt {
        match self {
            BlockStmtOrExpr::BlockStmt(block) => block.to_owned(),
            BlockStmtOrExpr::Expr(expr) => BlockStmt {
                span: DUMMY_SP,
                stmts: vec![Stmt::Return(ReturnStmt {
                    span: DUMMY_SP,
                    arg: Some(expr.clone()),
                })],
            },
        }
    }
}
struct HasJSX {
    found: bool,
}
impl Visit for HasJSX {
    fn visit_jsx_element(&mut self, _: &JSXElement) {
        self.found = true;
    }
}

fn has_jsx<N>(n: &N) -> bool
where
    N: VisitWith<HasJSX>,
{
    let mut v = HasJSX { found: false };
    n.visit_children_with(&mut v);
    v.found
}

impl FunctionLike<'_> {
    fn has_jsx(&self) -> bool {
        match self {
            FunctionLike::Arrow(arrow_expr) => has_jsx(*arrow_expr),
            FunctionLike::Fn(fn_expr) => has_jsx(*fn_expr),
        }
    }
    fn has_name(&self) -> bool {
        match self {
            FunctionLike::Arrow(_) => false,
            FunctionLike::Fn(fn_expr) => fn_expr.ident.is_some(),
        }
    }
}

impl<C> VisitMut for TransformVisitor<C>
where
    C: Comments,
{
    noop_visit_mut_type!();
    fn visit_mut_var_decl(&mut self, n: &mut VarDecl) {
        if let [first] = n.decls.as_mut_slice()
            && first.name.is_component_name()
            && let Some(init) = &mut first.init
            && let Some(component) = extract_fn_from_expr(init.unwrap_parens_mut())
            // && !component.has_name()
            && component.has_jsx()
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
        if n.ident.is_component_name()
            && has_jsx(n)
            && let Some(block_stmt) = &mut n.function.body
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

fn add_import(ident: Ident, source: Str, source_member_ident: Option<Ident>) -> ImportDecl {
    ImportDecl {
        span: DUMMY_SP,
        specifiers: vec![if let Some(source_member_ident) = source_member_ident {
            ImportSpecifier::Named(ImportNamedSpecifier {
                span: DUMMY_SP,
                local: ident,
                is_type_only: false,
                imported: Some(ModuleExportName::Ident(source_member_ident)),
            })
        } else {
            ImportSpecifier::Default(ImportDefaultSpecifier {
                span: DUMMY_SP,
                local: ident,
            })
        }],
        src: source.into(),
        type_only: false,
        with: None,
    }
}

fn add_require(ident: Ident, source: Str, source_member_ident: Option<Ident>) -> Stmt {
    Stmt::Decl(Decl::Var(Box::new(VarDecl {
        span: DUMMY_SP,
        kind: VarDeclKind::Const,
        declare: false,
        decls: vec![VarDeclarator {
            definite: false,
            span: DUMMY_SP,
            name: Pat::Ident(BindingIdent {
                id: ident,
                type_ann: None,
            }),
            init: {
                let import_call = Expr::Call(CallExpr {
                    span: DUMMY_SP,
                    type_args: None,
                    callee: Callee::Expr(Box::new(Expr::Ident(Ident {
                        span: DUMMY_SP,
                        sym: "require".into(),
                        optional: false,
                    }))),
                    args: vec![ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(source))),
                    }],
                });

                if let Some(source_member_ident) = source_member_ident {
                    Some(Box::new(Expr::Member(MemberExpr {
                        span: DUMMY_SP,
                        obj: Box::new(import_call),
                        prop: MemberProp::Ident(source_member_ident),
                    })))
                } else {
                    Some(Box::new(import_call))
                }
            },
        }],
    })))
}

fn get_visitor<C>(c: C) -> TransformVisitor<C>
where
    C: Comments,
{
    TransformVisitor {
        use_signals_import_source: get_default_import_source(),
        import_use_signals: None,
        comments: c,
        mode: TransformMode::All,
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
    program.fold_with(&mut as_folder(get_visitor(PluginCommentsProxy)))
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
    |_| as_folder(get_visitor(PluginCommentsProxy)),
    boo,
    // Input codes
    r#"
const A = () => {
    function Beb(){
    }

    function Beb2(){
        return <div />
    }
    return <div />
};
const Cecek = () => <div />
const Cec = memo(() => {
    return <div />
})
const Cyc = React.lazy(React.memo(() => {
    return <div />
}), {})
const CycPlain = () => 5

function B(){
    return <div />
};

var C = function(){
    return <div />
};
var C2 = function C3(){
    return <div />
};
    "#,
    // Output codes after transformed with plugin
    r#"console.log("transform");"#
);
