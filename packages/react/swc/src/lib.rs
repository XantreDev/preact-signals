#![feature(box_patterns)]

use regex::Regex;
use swc_core::{
    common::{sync::Lazy, DUMMY_SP},
    ecma::{
        ast::*,
        atoms::Atom,
        parser::{EsConfig, Syntax},
        visit::{as_folder, noop_visit_mut_type, FoldWith, VisitMut, VisitMutWith},
    },
};
pub extern crate swc_core;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

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

enum SignalsStatus {
    OptIn,
    OptOut,
    Auto,
}

#[derive(PartialEq, Eq, Clone, Copy)]
enum Context {
    Root,
    Function,
    RenderFunction,
    ComponentLikeNameDeclr,
    ComponentLike,
    Component,
}

pub struct TransformVisitor {
    context: Context,
    should_add_import: bool,
    signals: SignalsStatus,
}

fn is_component_name(name: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new("^[A-Z]").unwrap());
    RE.is_match(name)
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

fn can_be_component_function(expr: &Expr) -> bool {
    match expr {
        Expr::Fn(it) => it.is_regular(),
        Expr::Arrow(it) => it.is_regular(),
        _ => false,
    }
}

impl VisitMut for TransformVisitor {
    noop_visit_mut_type!();
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_var_declarator(&mut self, n: &mut VarDeclarator) {
        match (&n.init, &n.name) {
            (Some(exp), Pat::Ident(ident))
                if is_component_name(ident.to_string().as_str())
                    && (can_be_component_function(exp)) =>
            {
                let old_context = self.context;
                self.context = Context::ComponentLikeNameDeclr;
                #[cfg(debug_assertions)]
                println!("is inside component");
                n.visit_mut_children_with(self);
                self.context = old_context;
            }
            _ => {
                let old_context = self.context;
                self.context = Context::Function;
                n.visit_mut_children_with(self);
                match self.context {
                    Context::RenderFunction => self.context = Context::Component,
                    _ => self.context = old_context,
                }
            }
        }
    }
    fn visit_mut_arrow_expr(&mut self, n: &mut ArrowExpr) {
        let old_context = self.context;
        match old_context {
            Context::ComponentLikeNameDeclr => {
                self.context = Context::ComponentLike;
            }
            _ => {
                self.context = Context::Function;
            }
        }

        n.visit_mut_children_with(self);
        self.context = old_context
    }
    fn visit_mut_fn_decl(&mut self, n: &mut FnDecl) {
        let old_context = self.context;
        match old_context {
            Context::ComponentLikeNameDeclr => n.visit_mut_children_with(self),
            _ if n.function.is_regular() && is_component_name(n.ident.to_string().as_str()) => {
                self.context = Context::ComponentLikeNameDeclr;
                n.visit_mut_children_with(self);
                self.context = old_context
            }
            _ => {}
        }
    }
    fn visit_mut_function(&mut self, n: &mut Function) {
        let old_context = self.context;

        match old_context {
            Context::ComponentLikeNameDeclr => {
                self.context = Context::ComponentLike;
            }
            _ => {
                self.context = Context::Function;
            }
        }

        n.visit_mut_children_with(self);
        self.context = old_context
    }
    fn visit_mut_stmts(&mut self, n: &mut Vec<Stmt>) {
        let old_context = self.context;
        match old_context {
            Context::ComponentLike => {
                n.visit_mut_children_with(self);
                #[cfg(debug_assertions)]
                println!("decide should transform");
                if self.context != Context::Component {
                    self.context = old_context;
                    return;
                }

                self.context = old_context;
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
                            callee: Callee::Expr(Box::new(Expr::Ident(Ident {
                                span: DUMMY_SP,
                                sym: Atom::from("useSignals"),
                                optional: false,
                            }))),
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

                *n = new_stmts;
                #[cfg(debug_assertions)]
                println!("tried to insert statements")
            }
            _ => {
                n.visit_mut_children_with(self);
            }
        }
    }

    fn visit_mut_jsx_element(&mut self, n: &mut JSXElement) {
        #[cfg(debug_assertions)]
        println!("is seen jsx element");
        match self.context {
            Context::Function => {
                self.context = Context::RenderFunction;
            }
            Context::ComponentLike => {
                self.context = Context::Component;
            }
            _ => {}
        }

        n.visit_mut_children_with(self)
    }
}

fn get_visitor() -> TransformVisitor {
    TransformVisitor {
        signals: SignalsStatus::Auto,
        context: Context::Root,
        should_add_import: false,
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
    program.fold_with(&mut as_folder(get_visitor()))
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
    |_| as_folder(get_visitor()),
    boo,
    // Input codes
    r#"const A = () => {
    return <div />
};

function B(){
    return <div />
};

var C = function(){
    return <div />
};
    "#,
    // Output codes after transformed with plugin
    r#"console.log("transform");"#
);
