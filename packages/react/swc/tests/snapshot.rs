use std::{
    env::{args, Args},
    fs::{self},
    io::{stdout, ErrorKind},
    path::PathBuf,
};

use serde::{Deserialize, Serialize};
use swc_core::{
    common::{
        comments::{Comments, SingleThreadedComments},
        errors::Emitter,
        pass,
        serializer::Node,
        FileName, SourceFile, SourceMap,
    },
    ecma::{
        ast::Pass,
        parser::{parse_file_as_module, parse_file_as_program},
        transforms::testing::{test_fixture, FixtureTestConfig, Tester},
        visit::{fold_pass, visit_mut_pass, VisitMut, VisitMutPass},
    },
};
use swc_plugin_preact_signals::{
    options::PreactSignalsPluginOptions,
    utils::{MaybeComponentName, Trackable},
    SignalsTransformVisitor,
};

#[cfg(test)]
fn get_syntax() -> swc_core::ecma::parser::Syntax {
    use swc_core::ecma::parser::{EsSyntax, Syntax};

    let mut es_syntax = EsSyntax::default();
    es_syntax.jsx = true;
    Syntax::Es(es_syntax)
}

trait FlatResult {
    type Ok;
    type Err;

    fn flat_ok(self) -> Result<Self::Ok, Self::Err>;
}

// impl<L, R> FlatResult for Vec<Result<L, R>> {
//     type Ok = Vec<L>;
//     type Err = R;

//     fn flat_result(self) -> Result<Self::Ok, Self::Err> {
//         let mut new_vec = Vec::with_capacity(self.len());
//         for item in self {
//             let ok = item?;
//             new_vec.push(ok);
//         }

//         Ok(new_vec)
//     }
// }

impl<U, T, E> FlatResult for U
where
    U: Iterator<Item = Result<T, E>>,
{
    type Ok = Vec<T>;
    type Err = E;

    fn flat_ok(self) -> Result<Self::Ok, Self::Err> {
        let (size, _) = self.size_hint();
        let mut new_vec = Vec::with_capacity(size);
        for item in self {
            let ok = item?;
            new_vec.push(ok);
        }

        Ok(new_vec)
    }
}

#[derive(Debug, Deserialize, Default)]
struct Options {
    file_name: Option<String>,
    #[serde(default)]
    options: PreactSignalsPluginOptions,
}

// struct PathWithSuffix<'a> {
//     path: &'a mut PathBuf
// }

// impl <'a> PathWithSuffix<'a> {
//     fn new(path: &'a mut PathBuf, suffix: &'static str) -> PathWithSuffix<'a> {
//         path.push(suffix);
//         PathWithSuffix { path }
//     }
// }
// impl <'a> Drop for PathWithSuffix<'a> {
//     fn drop(&mut self) {
//         self.path.pop();
//     }
// }

fn read_file_if_exist(
    path: &mut PathBuf,
    suffix: &'static str,
) -> Result<Option<String>, std::io::Error> {
    path.push(suffix);
    let res = fs::read_to_string(&path).map_or_else(
        |it| {
            if it.kind() == ErrorKind::NotFound {
                Ok(None)
            } else {
                Err(it)
            }
        },
        |it| Ok(Some(it)),
    );

    path.pop();

    res
}

fn read_file(path: &mut PathBuf, suffix: &'static str) -> Result<String, String> {
    path.push(suffix);
    let res =
        fs::read_to_string(&path).map_err(|it| format!(r#"Failed to read "{}": {}"#, suffix, it));
    path.pop();

    res
}

// fn run_updates<T>(dir_iter: T)  -> Result<(), String>
// where T : Iterator<Item = DirEntry> {
//     let mut errors = Vec::<String>::new();
//     for dir in dir_iter {
//         if !dir
//             .file_type()
//             .map(|it| it.is_dir())
//             .expect("unknown file type")
//         {
//             errors.push(format!("Unexpected file '{:?}' in test folder", dir.path()));
//             continue;
//         }

//         let mut dir_path = dir.path();
//         let test_name = dir_path.iter().last().unwrap().to_str().unwrap().to_owned();

//         let in_file = read_file(&mut dir_path, "in.js");
//         let options = read_file_if_exist(&mut dir_path, "options.json");
//         let out_file = read_file(&mut dir_path, "out.js");
//         let out_draft = read_file_if_exist(&mut dir_path, "out.draft.js");

//         let mut is_ok = true;
//         if in_file.is_err() {
//             errors.push(format!(r#"File 'in.js' doesn't exist for "{}""#, test_name));
//             is_ok = false;
//         }

//         if out_file.is_err() {
//             errors.push(format!(r#"File 'out.js' for "{}""#, test_name));
//             is_ok = false;
//         }
//         if options.is_err() {
//             errors.push(format!(
//                 r#"Failed to read 'options.json' for "{}""#,
//                 test_name
//             ));
//             is_ok = false;
//         }
//         if !is_ok {
//             continue;
//         }
//     }

//     if !errors.is_empty() {
//         return Err(errors.join("\n"));
//     }

//     Ok(())
// }
//
fn path_with_suffix(mut path: PathBuf, suffix: &'static str) -> PathBuf {
    path.push(suffix);
    path
}

fn run_tests() {
    // we use sync io, for this point of time it's now a problem
    let tests = std::fs::read_dir("./fixtures")
        .expect("fixtures exists")
        .flat_ok()
        .expect("files can be read");

    let mut errors = Vec::<String>::new();

    for dir in tests {
        if !dir
            .file_type()
            .map(|it| it.is_dir())
            .expect("unknown file type")
        {
            errors.push(format!("Unexpected file '{:?}' in test folder", dir.path()));
            continue;
        }

        let mut dir_path = dir.path();
        let test_name = dir_path.iter().last().unwrap().to_str().unwrap().to_owned();

        let options = read_file_if_exist(&mut dir_path, "options.json");

        // let in_content = match in_file {
        //     Ok(content) => content,
        //     Err(e) => {
        //         errors.push(e);
        //         continue;
        //     }
        // };

        // let expected_output = match out_file {
        //     Ok(content) => content,
        //     Err(e) => {
        //         errors.push(e);
        //         continue;
        //     }
        // };

        let plugin_options = match options {
            Ok(Some(content)) => match serde_json::from_str::<Options>(&content) {
                Ok(opts) => opts,
                Err(e) => {
                    errors.push(format!(
                        r#"Failed to parse 'options.json' for "{}": {}"#,
                        test_name, e
                    ));
                    continue;
                }
            },
            Ok(None) => Options {
                file_name: None,
                options: PreactSignalsPluginOptions::default(),
            },
            Err(e) => {
                errors.push(format!(
                    r#"Failed to read 'options.json' for "{}": {}"#,
                    test_name, e
                ));
                continue;
            }
        };

        // let cm = Rc::new(SourceMap::default());
        // let fm = cm.new_source_file( Arc::new(FileName::Custom(test_name.clone())), in_content);

        // let comments = Rc::new(SingleThreadedComments::default());

        // let mut _errors = Vec::new();
        // let program = match parse_file_as_program(&fm, get_syntax(), swc_core::ecma::ast::EsVersion::EsNext, Some(&comments), &mut _errors) {
        //     Ok(it) => it,
        //     Err(content) => {
        //         errors.push(format!(r#"failed to parse as module "{}": {:?}"#, test_name, content));
        //         continue;
        //     }
        // };

        // let visit_mut = visit_mut_pass(SignalsTransformVisitor::from_options(plugin_options.options, comments, options.file_name.map(|it| it.is_trackable()).unwrap_or(None)));

        // program.apply(visit_mut);

        // pub fn to_code_default(
        //     cm: Lrc<SourceMap>,
        //     comments: Option<&dyn Comments>,
        //     node: &impl Node,
        // ) -> String {
        //     let mut buf = std::vec::Vec::new();
        //     {
        //         let mut emitter = Emitter {
        //             cfg: Default::default(),
        //             cm: cm.clone(),
        //             comments,
        //             wr: text_writer::JsWriter::new(cm, "\n", &mut buf, None),
        //         };
        //         node.emit_with(&mut emitter).unwrap();
        //     }

        //     String::from_utf8(buf).expect("codegen generated non-utf8 output")
        // }
        // to_code_default(self.cm.clone(), Some(comments), program);

        use std::io::Write;
        writeln!(stdout(), "---\ntesting '{}'\n---", test_name).unwrap();
        let closure =
            |tester: &mut Tester| -> VisitMutPass<SignalsTransformVisitor<SingleThreadedComments>> {
                visit_mut_pass(SignalsTransformVisitor::from_options(
                    plugin_options.options.clone(),
                    (*tester.comments).clone(),
                    plugin_options
                        .file_name
                        .as_ref()
                        .map(|it| it.is_trackable())
                        .unwrap_or(None),
                ))
            };

        test_fixture::<VisitMutPass<SignalsTransformVisitor<SingleThreadedComments>>>(
            get_syntax(),
            &closure,
            &path_with_suffix(dir_path.clone(), "in.js"),
            &path_with_suffix(dir_path.clone(), "out.js"),
            FixtureTestConfig {
                sourcemap: false,
                allow_error: false,
                module: Some(true),
            },
        );
        // Run transformation
        // let result = test_fixture(
        //     get_syntax(),
        //     |tester| {
        //         swc_core::ecma::visit::visit_mut_pass(SignalsTransformVisitor::from_options(
        //         plugin_options,
        //         tester.comments.clone(),
        //         None,
        //     )),
        //     &fm,
        //     &expected_output,
        // );

        // if let Err(e) = result {
        //     errors.push(format!(r#"Test "{}" failed: {}"#, test_name, e));
        // }
    }
}

// test_inline!(
//     get_syntax(),
//     |tester| swc_core::ecma::visit::visit_mut_pass(SignalsTransformVisitor::from_default(
//         tester.comments.clone(),
//         Some(Trackable::Component)
//     )),
//     default_components,
//     // Input codes
//     r#"
// "#,
//     // Expected codes
//     r#"
// "#
// );

// test_inline!(
//     get_syntax(),
//     |tester| swc_core::ecma::visit::visit_mut_pass(SignalsTransformVisitor::from_options(
//         PreactSignalsPluginOptions::auto_hooks(),
//         tester.comments.clone(),
//         None
//     )),
//     hooks_code_is_transformed,
//     // Input codes
//     r#"
// "#,
//     // Expected codes
//     r#"
// "#
// );

// test_inline!(
//     get_syntax(),
//     |tester| swc_core::ecma::visit::visit_mut_pass(SignalsTransformVisitor::from_options(
//         PreactSignalsPluginOptions::auto_hooks(),
//         tester.comments.clone(),
//         None
//     )),
//     hook_code_auto,
//     r#"
// "#,
//     r#"
// "#
// );

// test_inline!(
//     get_syntax(),
//     |tester| swc_core::ecma::visit::visit_mut_pass(SignalsTransformVisitor::from_options(
//         PreactSignalsPluginOptions::auto_hooks_and_hook_usage_flag(),
//         tester.comments.clone(),
//         None
//     )),
//     hook_code_auto_with_ctx,
//     r#"
// "#,
//     r#"
// "#
// );

fn main() -> Result<(), String> {
    run_tests();

    Ok(())
}
