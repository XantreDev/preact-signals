use std::{
    fs::{self},
    io::{stdout, ErrorKind},
    path::PathBuf,
};

use serde::Deserialize;
use swc_core::{
    common::comments::SingleThreadedComments,
    ecma::{
        transforms::testing::{test_fixture, FixtureTestConfig, Tester},
        visit::{visit_mut_pass, VisitMutPass},
    },
};
use swc_plugin_preact_signals::{
    options::PreactSignalsPluginOptions, utils::MaybeComponentName, SignalsTransformVisitor,
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

        /* I've failed to avoid usage of the 'text_fixture', because low level api is weird */
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
    }

    if errors.len() > 0 {
        panic!("errors:\n {}", errors.join("\n"))
    }
}

fn main() -> Result<(), String> {
    run_tests();

    Ok(())
}
