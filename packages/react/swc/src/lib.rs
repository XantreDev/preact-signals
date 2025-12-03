#![feature(box_patterns, let_chains, if_let_guard, slice_take)]

pub mod utils;
use swc_core::common::SyntaxContext;
use utils::*;

use std::{
    borrow::BorrowMut,
    fmt::Debug,
    ops::{Deref, DerefMut},
};

use regex::Regex;
use std::path::PathBuf;
use swc_core::{
    common::comments::Comments,
    common::{comments::CommentKind, sync::Lazy, Span, DUMMY_SP},
    ecma::{
        ast::*,
        atoms::Atom,
        utils::{prepend_stmt, private_ident},
        visit::{noop_visit_mut_type, VisitMut, VisitMutWith},
    },
    plugin::{
        metadata::TransformPluginMetadataContextKind, plugin_transform,
        proxies::TransformPluginProgramMetadata,
    },
};

fn is_track_signals_directive(string: &str) -> bool {
    // https://github.com/preactjs/signals/blob/e04671469e9272de356109170b2e429db49db2f0/packages/react-transform/src/index.ts#L18
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#"(\s|^)@useSignals(\s|$)"#).unwrap());

    RE.is_match(string)
}
fn is_no_track_signals_directive(string: &str) -> bool {
    static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r#"(\s|^)@noUseSignals(\s|$)"#).unwrap());

    RE.is_match(string)
}

trait StrExt {
    fn from_str(str: &str) -> Str;
    fn signals_default_source() -> Str;
}
impl StrExt for Str {
    fn from_str(str: &str) -> Str {
        Str {
            span: DUMMY_SP,
            value: Atom::new(str),
            raw: None,
        }
    }
    fn signals_default_source() -> Str {
        Str::from_str("@preact-signals/safe-react/tracking")
    }
}
trait IdentExt {
    fn use_signals(ctxt: SyntaxContext) -> Ident;
}
impl IdentExt for Ident {
    fn use_signals(ctxt: SyntaxContext) -> Ident {
        Ident {
            span: DUMMY_SP,
            sym: "useSignals".into(),
            ctxt,
            optional: false,
        }
    }
}

pub mod options {
    use serde::Deserialize;

    #[derive(PartialEq, Eq, Deserialize, Default, Debug, Clone, Copy)]
    #[serde(rename_all = "kebab-case")]
    pub enum TransformMode {
        Manual,
        /**
         * all options affects only components
         */
        #[default]
        All,
        Auto,
    }

    #[derive(Deserialize, Debug, Clone, Copy)]
    #[serde(rename_all = "camelCase")]
    pub struct PreactSignalsPluginExperimental {
        #[serde(default)]
        pub add_hook_usage_flag: bool,
    }
    impl Default for PreactSignalsPluginExperimental {
        fn default() -> Self {
            Self {
                add_hook_usage_flag: false,
            }
        }
    }
    fn default_import_source() -> String {
        "@preact-signals/safe-react/tracking".into()
    }
    fn default_transform_hooks() -> bool {
        true
    }

    #[derive(Deserialize, Debug, Clone)]
    #[serde(rename_all = "camelCase")]
    pub struct PreactSignalsPluginOptions {
        #[serde(default)]
        pub mode: TransformMode,
        #[serde(default = "default_import_source")]
        pub import_source: String,
        #[serde(default = "default_transform_hooks")]
        pub transform_hooks: bool,
        #[serde(default)]
        pub experimental: PreactSignalsPluginExperimental,
    }

    impl Default for PreactSignalsPluginOptions {
        fn default() -> Self {
            PreactSignalsPluginOptions {
                mode: TransformMode::default(),
                import_source: default_import_source(),
                transform_hooks: default_transform_hooks(),
                experimental: PreactSignalsPluginExperimental::default(),
            }
        }
    }
    impl PreactSignalsPluginOptions {
        pub fn auto_hooks() -> PreactSignalsPluginOptions {
            PreactSignalsPluginOptions {
                mode: TransformMode::Auto,
                import_source: default_import_source(),
                transform_hooks: true,
                experimental: PreactSignalsPluginExperimental::default(),
            }
        }
        pub fn auto_hooks_and_hook_usage_flag() -> PreactSignalsPluginOptions {
            PreactSignalsPluginOptions {
                mode: TransformMode::Auto,
                import_source: default_import_source(),
                transform_hooks: true,
                experimental: PreactSignalsPluginExperimental {
                    add_hook_usage_flag: true,
                },
            }
        }

        pub fn auto_hooks_context_flags() -> PreactSignalsPluginOptions {
            PreactSignalsPluginOptions {
                mode: TransformMode::Auto,
                import_source: default_import_source(),
                transform_hooks: true,
                experimental: PreactSignalsPluginExperimental {
                    add_hook_usage_flag: true,
                },
            }
        }
    }
}
use options::{PreactSignalsPluginOptions, TransformMode};

pub struct SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    comments: C,
    mode: TransformMode,
    import_use_signals: Option<Ident>,
    use_signals_import_source: Str,
    ignore_span: Option<Span>,
    file_trackable_name: Option<Trackable>,
    transform_hooks: bool,
    add_context_to_hooks: bool,
    // unresolved_mark: Mark,
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
    pub fn from_options(
        options: PreactSignalsPluginOptions,
        comments: C,
        file_trackable_name: Option<Trackable>,
        // unresolved_mark: Mark,
    ) -> Self {
        SignalsTransformVisitor {
            comments,
            file_trackable_name,
            mode: options.mode,
            import_use_signals: None,
            use_signals_import_source: Str::from_str(options.import_source.as_str()),
            transform_hooks: options.transform_hooks,
            ignore_span: None,
            add_context_to_hooks: options.experimental.add_hook_usage_flag,
            // unresolved_mark,
            // context_mark: unresolved_mark,
        }
    }
    pub fn from_default(
        comments: C,
        file_trackable_name: Option<Trackable>,
        // unresolved_mark: Mark,
    ) -> Self {
        SignalsTransformVisitor::from_options(
            PreactSignalsPluginOptions::default(),
            comments,
            file_trackable_name,
            // unresolved_mark,
        )
    }

    fn process_var_decl<T>(&mut self, n: &mut VarDecl, additional_spans: Option<&[&Span]>) {
        if let Some(first) = n.decls.as_mut_slice().first_mut()
            && let Some(init) = &mut first.init
            && let child_span = init.unwrap_parens().get_span().clone()
            && let Some(mut component) = extract_fn_from_expr(init.unwrap_parens_mut())
            && let defaults_spans = &[&child_span, &n.span]
            && let spans = if let Some(extra_spans) = additional_spans {
                [defaults_spans, extra_spans].concat()
            } else {
                defaults_spans.to_vec()
            }
            && let Some(trackable) = match component.get_fn_ident() {
                None => {
                    self.should_track_option_ident(&spans, Some(&first.name), &component, false)
                }
                Some(ident) => {
                    self.should_track_option_ident(&spans, Some(&ident), &component, false)
                }
            }
        {
            self.track(trackable, &mut component);
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
    let comments = comments.get_leading(span.lo);
    println!(
        "comments: {:?}",
        comments.as_ref().map(|it| it
            .iter()
            .map(|it| it.text.as_str())
            .collect::<Vec<_>>()
            .join(", "))
    );

    match comments {
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

impl<C> SignalsTransformVisitor<C>
where
    C: Comments + Debug,
{
    fn is_trackable<I>(&self, ident: Option<&I>, is_default_export: bool) -> Option<Trackable>
    where
        I: MaybeComponentName,
    {
        if is_default_export && ident.is_none() {
            self.file_trackable_name.to_owned()
        } else {
            ident.and_then(|it| it.is_trackable())
        }
    }

    #[inline]
    fn should_track_option_ident<I, Comp>(
        &self,
        comment_spans: &[&Span],
        ident: Option<&I>,
        component: &Comp,
        is_default_export: bool,
    ) -> Option<Trackable>
    where
        Comp: Detectable,
        I: MaybeComponentName,
    {
        let comments: &C = &self.comments;
        let should_track = comment_spans
            .into_iter()
            .filter_map(|span| match should_track_by_comment(comments, span) {
                ShouldTrack::Auto => None,
                it => Some(it),
            })
            .reduce(|acc, it| match (acc, it) {
                (ShouldTrack::OptIn, ShouldTrack::OptOut) => ShouldTrack::OptOut,
                (ShouldTrack::OptOut, ShouldTrack::OptIn) => ShouldTrack::OptOut,
                (_, it) => it,
            })
            .unwrap_or(ShouldTrack::Auto);

        match should_track {
            ShouldTrack::Auto => {
                let this = &self;
                match this.mode {
                    TransformMode::Manual => None,
                    TransformMode::Auto => match this.is_trackable(ident, is_default_export) {
                        Some(Trackable::Hook)
                            if this.transform_hooks && component.has_dot_value() =>
                        {
                            Some(Trackable::Hook)
                        }
                        Some(Trackable::Component)
                            if component.has_jsx() && component.has_dot_value() =>
                        {
                            Some(Trackable::Component)
                        }
                        _ => None,
                    },
                    TransformMode::All => match this.is_trackable(ident, is_default_export) {
                        Some(Trackable::Hook)
                            if this.transform_hooks && component.has_dot_value() =>
                        {
                            Some(Trackable::Hook)
                        }
                        Some(Trackable::Component) if component.has_jsx() => {
                            Some(Trackable::Component)
                        }
                        _ => None,
                    },
                }
            }
            ShouldTrack::OptIn => Some(
                self.is_trackable(ident, is_default_export)
                    .unwrap_or(Trackable::Unknown),
            ),
            ShouldTrack::OptOut => None,
        }
    }

    #[inline]
    fn track<TWrappable>(&mut self, trackable: Trackable, wrappable: &mut TWrappable)
    where
        TWrappable: SignalWrappable,
    {
        wrappable.wrap_with_use_signals(
            self.get_import_use_signals(),
            match self.add_context_to_hooks {
                false => None,
                true => Some(trackable),
            },
        )
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
            self.process_var_decl::<SignalsTransformVisitor<C>>(n, None)
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_export_decl(&mut self, n: &mut ExportDecl) {
        match n {
            ExportDecl {
                span,
                decl: Decl::Var(ref mut var_decl),
            } => {
                self.process_var_decl::<SignalsTransformVisitor<C>>(
                    var_decl.deref_mut(),
                    Some(&[&span]),
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
                self.should_track_option_ident(
                    &[&span, &fn_declr.function.span],
                    Some(&fn_declr.ident),
                    fn_declr,
                    false,
                )
                .inspect(|trackable| self.track(trackable.clone(), &mut *fn_declr.function));

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
                if let Some(trackable) = self.should_track_option_ident(
                    &[&span, &fn_expr.function.span],
                    fn_expr.ident.as_ref(),
                    fn_expr,
                    true,
                ) {
                    self.track(trackable, &mut *fn_expr.function);
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
        let ExportDefaultExpr { ref mut expr, span } = n;
        let child_span = expr.unwrap_parens().get_span().clone();

        if let Some(mut component) = extract_fn_from_expr(expr.unwrap_parens_mut()) {
            self.should_track_option_ident(
                &[&span, &child_span],
                component.get_fn_ident().as_ref(),
                &component,
                true,
            )
            .inspect(|trackable| self.track(trackable.clone(), &mut component));
        }

        n.visit_mut_children_with(self);
        // let old_span = self.ignore_span;
        // self.ignore_span = Some(child_span);
        // self.ignore_span = old_span
    }
    fn visit_mut_fn_decl(&mut self, n: &mut FnDecl) {
        if match self.ignore_span {
            Some(span) => !span.eq(&n.function.span),
            None => true,
        } && let Some(trackable) =
            self.should_track_option_ident(&[&n.function.span], Some(&n.ident), n, false)
        {
            self.track(trackable, &mut *n.function)
        }
        n.visit_mut_children_with(self);
    }

    fn visit_mut_assign_expr(&mut self, n: &mut AssignExpr) {
        if let Some(mut component) = extract_fn_from_expr(n.right.borrow_mut())
            && let Some(trackable) = match component.get_fn_ident() {
                None => {
                    self.should_track_option_ident(&[&n.span], Some(&n.left), &component, false)
                }
                Some(ident) => {
                    self.should_track_option_ident(&[&n.span], Some(&ident), &component, false)
                }
            }
        {
            self.track(trackable, &mut component);
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_key_value_prop(&mut self, n: &mut KeyValueProp) {
        if let Some(mut component) = extract_fn_from_expr(&mut n.value)
            && let Some(trackable) = self.should_track_option_ident(
                &[n.key.get_span()],
                Some(
                    &component
                        .get_fn_ident()
                        .map_or(n.key.clone(), |it| PropName::Ident(it.into())),
                ),
                &component,
                false,
            )
        {
            self.track(trackable, &mut component);
        }

        n.visit_mut_children_with(self);
    }
    fn visit_mut_method_prop(&mut self, n: &mut MethodProp) {
        if let Some(trackable) = self.should_track_option_ident(
            &[&n.function.span, n.key.get_span()],
            Some(&n.key),
            n.function.deref(),
            false,
        ) {
            self.track(trackable, &mut *n.function);
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
                        Some(Ident::use_signals(ident.ctxt)),
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
                    Some(Ident::use_signals(ident.ctxt)),
                    ident.ctxt,
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
pub fn process_transform(
    mut program: Program,
    _metadata: TransformPluginProgramMetadata,
) -> Program {
    // _metadata.mark
    program.visit_mut_with(
        &mut ({
            let data = _metadata.get_transform_plugin_config();

            let file_has_trackable_name = _metadata
                .get_context(&TransformPluginMetadataContextKind::Filename)
                .map(|it| PathBuf::from(it))
                .and_then(|it| {
                    it.file_name()
                        .and_then(|it| it.to_str())
                        .and_then(|it| it.is_trackable())
                });

            use serde_json;
            match data {
                Some(data) => {
                    let options = serde_json::from_str::<PreactSignalsPluginOptions>(data.as_str())
                        .expect("transform plugin config should be valid json");
                    SignalsTransformVisitor::from_options(
                        options,
                        _metadata.comments,
                        file_has_trackable_name,
                        // _metadata.unresolved_mark,
                    )
                }
                None => SignalsTransformVisitor::from_default(
                    _metadata.comments,
                    file_has_trackable_name,
                    // _metadata.unresolved_mark,
                ),
            }
        }),
    );
    program
}
