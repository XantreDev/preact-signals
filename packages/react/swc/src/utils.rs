use regex::Regex;
use swc_core::{
    common::{sync::Lazy, Span, DUMMY_SP},
    ecma::{
        ast::*,
        atoms::Atom,
        utils::private_ident,
        visit::{Visit, VisitWith},
    },
};

pub trait FunctionLikeExpr {
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

fn is_component_name(name: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new("^[A-Z]").unwrap());
    RE.is_match(name)
}

fn is_hook_name(name: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new("^use[A-Z]").unwrap());
    RE.is_match(name)
}

#[derive(Clone)]
pub enum Trackable {
    Hook,
    Component,
    Unknown,
}
impl Trackable {
    pub fn to_arg(&self, add_hook_usage_flag: bool) -> Option<u8> {
        match (add_hook_usage_flag, self) {
            (false, _) => None,
            (true, Trackable::Component) => Some(1),
            (true, Trackable::Hook) => Some(2),
            (true, Trackable::Unknown) => Some(0),
        }
    }
}
pub trait MaybeComponentName {
    fn is_trackable(&self) -> Option<Trackable>;
}

impl MaybeComponentName for str {
    fn is_trackable(&self) -> Option<Trackable> {
        if is_component_name(self) {
            Some(Trackable::Component)
        } else if is_hook_name(self) {
            Some(Trackable::Hook)
        } else {
            None
        }
    }
}

impl MaybeComponentName for Str {
    fn is_trackable(&self) -> Option<Trackable> {
        self.value.as_str().is_trackable()
    }
}
impl MaybeComponentName for Ident {
    fn is_trackable(&self) -> Option<Trackable> {
        self.sym.as_str().is_trackable()
    }
}
impl MaybeComponentName for BindingIdent {
    fn is_trackable(&self) -> Option<Trackable> {
        self.id.is_trackable()
    }
}
impl MaybeComponentName for Pat {
    fn is_trackable(&self) -> Option<Trackable> {
        if let Pat::Ident(id) = self {
            id.is_trackable()
        } else {
            None
        }
    }
}

// this crazy stuff is not supported in babel
/* fn get_left_add_binary(left: &Expr) -> Option<&Expr> {
    match left {
        Expr::Bin(BinExpr {
            span: _,
            left,
            op: BinaryOp::Add,
            right: _,
        }) => get_left_add_binary(left),
        _ => Some(left),
    }
} */

impl MaybeComponentName for MemberProp {
    fn is_trackable(&self) -> Option<Trackable> {
        match self {
            MemberProp::Ident(ident) => ident.is_trackable(),
            MemberProp::PrivateName(_) => None,
            MemberProp::Computed(ComputedPropName { span: _, expr }) => {
                let Expr::Lit(Lit::Str(Str {
                    span: _,
                    value,
                    raw: _,
                })) = expr.unwrap_parens()
                else {
                    return None;
                };
                /* else if let Some(Expr::Lit(Lit::Str(left_str))) = get_left_add_binary(expr) {
                    is_component_name(left_str.value.as_str())
                }  */

                value.as_str().is_trackable()
            }
        }
    }
}
impl MaybeComponentName for Expr {
    fn is_trackable(&self) -> Option<Trackable> {
        match self.unwrap_parens() {
            Expr::Ident(ident) => ident.is_trackable(),
            Expr::Member(member_expr) => member_expr.prop.is_trackable(),
            Expr::Lit(Lit::Str(str)) => str.is_trackable(),
            _ => None,
        }
    }
}
impl MaybeComponentName for PropName {
    fn is_trackable(&self) -> Option<Trackable> {
        match self {
            PropName::Computed(computed_expr) => computed_expr.expr.is_trackable(),
            PropName::Str(str) => str.is_trackable(),
            PropName::Ident(ident) => ident.is_trackable(),
            _ => None,
        }
    }
}

impl MaybeComponentName for AssignTarget {
    fn is_trackable(&self) -> Option<Trackable> {
        let AssignTarget::Simple(pat) = self else {
            return None;
        };
        match pat {
            SimpleAssignTarget::Ident(ident) => ident.is_trackable(),
            SimpleAssignTarget::Member(member) => member.prop.is_trackable(),
            SimpleAssignTarget::Paren(paren) => paren.expr.is_trackable(),
            _ => None,
        }
    }
}

pub enum FunctionLike<'a> {
    Arrow(&'a mut ArrowExpr),
    Fn(&'a mut FnExpr),
}
pub fn wrap_with_use_signals(
    n: &Vec<Stmt>,
    use_signals_ident: Ident,
    arg: Option<u8>,
) -> Vec<Stmt> {
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
                args: match arg {
                    Some(value) => vec![ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            span: DUMMY_SP,
                            value: value.into(),
                            raw: None,
                        }))),
                    }],
                    None => vec![],
                },
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

pub trait SignalWrappable {
    fn wrap_with_use_signals(&mut self, import_use_signals: Ident, arg: Option<u8>);
}

impl<'a> FunctionLike<'a> {
    pub fn get_fn_ident(&self) -> Option<Ident> {
        match self {
            FunctionLike::Fn(FnExpr {
                function: _,
                ident: Some(function_ident),
            }) => Some(function_ident.clone()),
            _ => None,
        }
    }
}

impl SignalWrappable for Function {
    fn wrap_with_use_signals(&mut self, import_use_signals: Ident, arg: Option<u8>) {
        if let Some(body) = &mut self.body {
            body.stmts = wrap_with_use_signals(&body.stmts, import_use_signals, arg);
        }
    }
}
impl<'a> SignalWrappable for FunctionLike<'a> {
    fn wrap_with_use_signals(&mut self, import_use_signals: Ident, arg: Option<u8>) {
        match self {
            FunctionLike::Arrow(arrow_expr) => {
                let this = &mut *arrow_expr;
                let mut block = this.body.to_block();
                let wrapped_body = wrap_with_use_signals(&block.stmts, import_use_signals, arg);
                block.stmts = wrapped_body;
                this.body = Box::new(BlockStmtOrExpr::BlockStmt(block.to_owned()));
            }
            FunctionLike::Fn(fn_expr) => {
                fn_expr
                    .function
                    .wrap_with_use_signals(import_use_signals, arg);
            }
        }
    }
}

pub fn extract_fn_from_expr<'a>(expr: &'a mut Expr) -> Option<FunctionLike<'a>> {
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

pub trait Blockable {
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
    fn visit_jsx_fragment(&mut self, _: &JSXFragment) {
        self.found = true;
    }
}

struct HasDotValue {
    found: bool,
}
impl Visit for HasDotValue {
    fn visit_member_expr(&mut self, n: &MemberExpr) {
        if self.found {
            return;
        }

        if match &n.prop {
            MemberProp::Ident(ident) => ident.sym.as_str() == "value",
            MemberProp::Computed(ComputedPropName { span: _, expr }) => {
                if let Expr::Lit(Lit::Str(Str {
                    span: _,
                    value,
                    raw: _,
                })) = expr.unwrap_parens()
                {
                    value.as_str() == "value"
                } else {
                    false
                }
            }
            _ => false,
        } {
            self.found = true;
            return;
        }
        n.visit_children_with(self);
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
fn has_dot_value<N>(n: &N) -> bool
where
    N: VisitWith<HasDotValue>,
{
    let mut v = HasDotValue { found: false };
    n.visit_children_with(&mut v);
    v.found
}

pub trait Detectable {
    fn has_jsx(&self) -> bool;
    fn has_dot_value(&self) -> bool;
}

impl Detectable for FunctionLike<'_> {
    fn has_jsx(&self) -> bool {
        match self {
            FunctionLike::Arrow(arrow_expr) => has_jsx(*arrow_expr),
            FunctionLike::Fn(fn_expr) => has_jsx(*fn_expr),
        }
    }
    fn has_dot_value(&self) -> bool {
        match self {
            FunctionLike::Arrow(arrow_expr) => has_dot_value(*arrow_expr),
            FunctionLike::Fn(fn_expr) => has_dot_value(*fn_expr),
        }
    }
}
impl Detectable for FnDecl {
    fn has_jsx(&self) -> bool {
        has_jsx(&self.function)
    }
    fn has_dot_value(&self) -> bool {
        has_dot_value(&self.function)
    }
}
impl Detectable for FnExpr {
    fn has_jsx(&self) -> bool {
        has_jsx(&self.function)
    }
    fn has_dot_value(&self) -> bool {
        has_dot_value(&self.function)
    }
}
impl Detectable for Function {
    fn has_jsx(&self) -> bool {
        has_jsx(self)
    }
    fn has_dot_value(&self) -> bool {
        has_dot_value(self)
    }
}

pub fn add_import(ident: Ident, source: Str, source_member_ident: Option<Ident>) -> ImportDecl {
    ImportDecl {
        span: DUMMY_SP,
        phase: ImportPhase::Evaluation,
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

pub fn add_require(ident: Ident, source: Str, source_member_ident: Option<Ident>) -> Stmt {
    Stmt::Decl(Decl::Var(Box::new(VarDecl {
        span: DUMMY_SP,
        kind: VarDeclKind::Var,
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

pub trait Spanned {
    fn get_span(&self) -> &Span;
}

impl Spanned for Lit {
    fn get_span(&self) -> &Span {
        match self {
            Lit::Bool(lit) => &lit.span,
            Lit::Num(lit) => &lit.span,
            Lit::Str(lit) => &lit.span,
            Lit::BigInt(lit) => &lit.span,
            Lit::Null(lit) => &lit.span,
            Lit::Regex(lit) => &lit.span,
            Lit::JSXText(lit) => &lit.span,
        }
    }
}
impl Spanned for PropName {
    fn get_span(&self) -> &Span {
        match self {
            PropName::BigInt(it) => &it.span,
            PropName::Computed(it) => &it.span,
            PropName::Ident(it) => &it.span,
            PropName::Num(it) => &it.span,
            PropName::Str(it) => &it.span,
        }
    }
}

impl Spanned for Expr {
    fn get_span(&self) -> &Span {
        match self {
            Expr::Array(lit) => &lit.span,
            Expr::Arrow(lit) => &lit.span,
            Expr::Assign(lit) => &lit.span,
            Expr::Await(lit) => &lit.span,
            Expr::Bin(lit) => &lit.span,
            Expr::Call(lit) => &lit.span,
            Expr::Class(lit) => &lit.class.span,
            Expr::Cond(lit) => &lit.span,
            Expr::Fn(lit) => &lit.function.span,
            Expr::Ident(lit) => &lit.span,
            Expr::Lit(lit) => lit.get_span(),
            Expr::Member(lit) => &lit.span,
            Expr::MetaProp(lit) => &lit.span,
            Expr::New(lit) => &lit.span,
            Expr::Object(lit) => &lit.span,
            Expr::Paren(lit) => &lit.span,
            Expr::PrivateName(lit) => &lit.span,
            Expr::Seq(lit) => &lit.span,
            Expr::TaggedTpl(lit) => &lit.span,
            Expr::This(lit) => &lit.span,
            Expr::Tpl(lit) => &lit.span,
            Expr::Unary(lit) => &lit.span,
            Expr::Update(lit) => &lit.span,
            Expr::Yield(lit) => &lit.span,
            Expr::JSXMember(lit) => &lit.prop.span,
            Expr::JSXNamespacedName(lit) => &lit.ns.span,
            Expr::JSXEmpty(lit) => &lit.span,
            Expr::JSXElement(lit) => &lit.span,
            Expr::JSXFragment(lit) => &lit.span,
            Expr::TsTypeAssertion(lit) => &lit.span,
            Expr::TsConstAssertion(lit) => &lit.span,
            Expr::TsNonNull(lit) => &lit.span,
            Expr::TsAs(lit) => &lit.span,
            Expr::TsInstantiation(lit) => &lit.span,
            Expr::TsSatisfies(lit) => &lit.span,
            Expr::Invalid(it) => &it.span,
            Expr::SuperProp(it) => &it.span,
            Expr::OptChain(it) => &it.span,
        }
    }
}
