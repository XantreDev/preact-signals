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

pub struct TransformVisitor {
    signals: SignalsStatus,
    is_inside_component: bool,
    is_inside_function: bool,
    has_jsx: bool,
    should_transform: bool,
}

fn is_component_name(name: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new("^[A-Z]").unwrap());
    RE.is_match(name)
}
fn can_be_component_function(expr: &Expr) -> bool {
    match expr {
        Expr::Fn(it) if !it.function.is_async && !it.function.is_generator => true,
        Expr::Arrow(it) if !it.is_async && !it.is_generator => true,
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
                let old_is_inside_component = self.is_inside_component;
                self.is_inside_component = true;
                #[cfg(debug_assertions)]
                println!("is inside component");
                n.visit_mut_children_with(self);
                self.is_inside_component = old_is_inside_component;
            }
            _ => {
                let old_is_inside_component = self.is_inside_component;
                self.is_inside_component = false;
                n.visit_mut_children_with(self);
                self.is_inside_component = old_is_inside_component;
            }
        }
    }
    fn visit_mut_arrow_expr(&mut self, n: &mut ArrowExpr) {
        let old_self_is_inside_function = self.is_inside_function;
        self.is_inside_function = true;
        n.visit_mut_children_with(self);
        self.is_inside_component = old_self_is_inside_function;
    }
    fn visit_mut_function(&mut self, n: &mut Function) {
        let old_self_is_inside_function = self.is_inside_function;
        self.is_inside_function = true;
        n.visit_mut_children_with(self);
        self.is_inside_component = old_self_is_inside_function;
    }
    fn visit_mut_stmts(&mut self, n: &mut Vec<Stmt>) {
        if !self.is_inside_component || !self.is_inside_function {
            return n.visit_mut_children_with(self);
        }
        let old_has_jsx = self.has_jsx;
        self.has_jsx = false;
        n.visit_mut_children_with(self);
        #[cfg(debug_assertions)]
        println!("decide should transform");
        if !self.has_jsx {
            self.has_jsx = old_has_jsx;
            return;
        }

        self.has_jsx = old_has_jsx;
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

    fn visit_mut_jsx_element(&mut self, n: &mut JSXElement) {
        #[cfg(debug_assertions)]
        println!("is seen jsx element");
        if self.is_inside_component {
            self.has_jsx = true;
        }
        n.visit_mut_children_with(self)
    }
}

fn get_visitor() -> TransformVisitor {
    TransformVisitor {
        should_transform: false,
        signals: SignalsStatus::Auto,
        is_inside_component: false,
        is_inside_function: false,
        has_jsx: false,
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
