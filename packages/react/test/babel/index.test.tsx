import { parse, transform, traverse } from "@babel/core";
import type { Visitor } from "@babel/core";
import type { Scope } from "@babel/traverse";
import prettier from "prettier";
import path from "node:path";
import signalsTransform, { PluginOptions } from "../../src/babel";
import {
  CommentKind,
  GeneratedCode,
  assignmentComp,
  objAssignComp,
  declarationComp,
  exportDefaultComp,
  exportNamedComp,
  objectPropertyComp,
  variableComp,
  objMethodComp,
} from "./helpers";
import * as swcCore from "@swc/core";
import { expect, it, describe, vi, ExpectStatic } from "vitest";
import { beforeAll } from "vitest";
import { afterAll } from "vitest";

// To help interactively debug a specific test case, add the test ids of the
// test cases you want to debug to the `debugTestIds` array, e.g. (["258",
// "259"]). Set to true to debug all tests.
const DEBUG_TEST_IDS: string[] | true = [];

const removeComments = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, "").trim();

const format = (code: string) => prettier.format(code, { parser: "babel" });

const getSwcConfig = (
  usePlugin: false | PluginOptions,
  filename: string | undefined,
  isCJS: boolean
) =>
  ({
    jsc: {
      experimental: usePlugin
        ? {
            plugins: [[path.resolve(__dirname, "../../swc"), usePlugin]],
          }
        : undefined,
      preserveAllComments: true,
      target: "esnext",
      minify: {
        format: {
          comments: false,
        },
      },
      parser: {
        syntax: "ecmascript",
        jsx: true,
      },
    },
    ...(filename ? { filename } : {}),
    isModule: !isCJS,
  }) satisfies swcCore.Options;

function transformCode(
  code: string,
  options: TransformerTestOptions,
  filename?: string,
  isCJS?: boolean
) {
  if (options.type === "babel") {
    return (
      transform(code, {
        filename,
        plugins: [
          [signalsTransform, options.options],
          "@babel/plugin-syntax-jsx",
        ],
        sourceType: isCJS ? "script" : "module",
      })?.code ?? ""
    );
  }

  return swcCore
    .transform(code, getSwcConfig(options.options, filename, !!isCJS))

    .then((it) => it.code);
}
type TransformerTestOptions =
  | {
      type: "babel";
      options: PluginOptions;
    }
  | {
      type: "swc";
      options: PluginOptions;
    };
const TransformerTestOptions = {
  makeBabel: (options: PluginOptions): TransformerTestOptions =>
    TransformerTestOptions.make("babel", options),
  make: (
    type: "babel" | "swc",
    options: PluginOptions
  ): TransformerTestOptions => ({
    type,
    options,
  }),
  makeFromMode: (
    type: "babel" | "swc",
    mode: PluginOptions["mode"],
    options?: Omit<PluginOptions, "mode">
  ) => ({
    type,
    options: { ...options, mode },
  }),
};

const toThenable = <T,>(value: T | Promise<T>): PromiseLike<T> => {
  if (value instanceof Promise) return value;
  return {
    then(cb) {
      if (!cb) {
        return this;
      }
      const res = cb(value);
      // @ts-expect-error
      return res instanceof Promise ? res : toThenable(res);
    },
  };
};

async function runTest(
  expect: ExpectStatic,
  input: string,
  expected: string,
  options: TransformerTestOptions,
  isCJS: boolean,
  compareWithoutComments: boolean,
  filename?: string
) {
  expect(
    await toThenable(transformCode(input, options, filename, isCJS))
      .then((it) => (compareWithoutComments ? removeComments(it) : it))
      .then(format)
  ).to.equal(
    await toThenable(
      options.type === "swc"
        ? swcCore
            .transform(expected, getSwcConfig(false, filename, !!isCJS))
            .then((it) => it.code)
        : expected
    )
      .then((it) => (compareWithoutComments ? removeComments(it) : it))
      .then(format)
  );
}

interface TestCaseConfig {
  /** Whether to use components whose body contains valid code auto mode would transform (true) or not (false) */
  useValidAutoMode: boolean;
  /** Whether to assert that the plugin transforms the code (true) or not (false) */
  expectTransformed: boolean;
  /** What kind of opt-in or opt-out to include if any */
  comment?: CommentKind;
  compareWithoutComments?: true;
  /** Options to pass to the babel plugin */
  options: TransformerTestOptions;
}

let testCount = 0;
const getTestId = () => (testCount++).toString().padStart(3, "0");

async function runTestCases(
  config: TestCaseConfig,
  testCases: GeneratedCode[]
) {
  testCases = (
    await Promise.all(
      testCases.map(async (t) => ({
        ...t,
        input: await format(t.input),
        transformed: await format(t.transformed),
      }))
    )
  ).sort((a, b) => (a.name < b.name ? -1 : 1));

  for (const testCase of testCases) {
    let testId = getTestId();

    // Only run tests in debugTestIds
    if (
      Array.isArray(DEBUG_TEST_IDS) &&
      DEBUG_TEST_IDS.length > 0 &&
      !DEBUG_TEST_IDS.includes(testId)
    ) {
      continue;
    }

    it(`(${testId}) ${testCase.name}`, async ({ expect }) => {
      if (DEBUG_TEST_IDS === true || DEBUG_TEST_IDS.includes(testId)) {
        console.log("input :", testCase.input.replace(/\s+/g, " ")); // eslint-disable-line no-console
        debugger; // eslint-disable-line no-debugger
      }

      const input = testCase.input;
      let expected = "";
      if (config.expectTransformed) {
        expected +=
          'import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";\n';
        expected += testCase.transformed;
      } else {
        expected = input;
      }

      const filename = config.useValidAutoMode
        ? "/path/to/Component.js"
        : "C:\\path\\to\\lowercase.js";

      await runTest(
        expect,
        input,
        expected,
        config.options,
        false,
        !!config.compareWithoutComments,
        filename
      );
    });
  }
}

function runGeneratedTestCases(config: TestCaseConfig) {
  const codeConfig = { auto: config.useValidAutoMode, comment: config.comment };

  // e.g. function C() {}
  describe("function components", async () => {
    await runTestCases(config, declarationComp(codeConfig));
  });

  // e.g. const C = () => {};
  describe("variable declared components", async () => {
    await runTestCases(config, variableComp(codeConfig));
  });

  // for now, inline comments are out of scope
  if (config.comment !== undefined) {
    // e.g. const C = () => {};
    describe("variable declared components (inline comment)", async () => {
      await runTestCases(
        config,
        variableComp({
          ...codeConfig,
          comment: undefined,
          inlineComment: config.comment,
        })
      );
    });
  }

  describe("object method components", async () => {
    await runTestCases(config, objMethodComp(codeConfig));
  });

  // e.g. C = () => {};
  describe("assigned to variable components", async () => {
    await runTestCases(config, assignmentComp(codeConfig));
  });

  // e.g. obj.C = () => {};
  describe("assigned to object property components", async () => {
    await runTestCases(config, objAssignComp(codeConfig));
  });

  // e.g. const obj = { C: () => {} };
  describe("object property components", async () => {
    await runTestCases(config, objectPropertyComp(codeConfig));
  });

  // e.g. export default () => {};
  describe(`default exported components`, async () => {
    await runTestCases(config, exportDefaultComp(codeConfig));
  });

  // e.g. export function C() {}
  describe("named exported components", async () => {
    await runTestCases(config, exportNamedComp(codeConfig));
  });
}

beforeAll(() => {
  console.time("all tests");
});
afterAll(() => {
  console.timeEnd("all tests");
});
for (const parser of ["swc", "babel"] as const) {
  describe.concurrent(`React Signals ${parser} Transform`, () => {
    describe.concurrent("auto mode transforms", () => {
      runGeneratedTestCases({
        useValidAutoMode: true,
        expectTransformed: true,
        options: TransformerTestOptions.makeFromMode(parser, "auto"),
      });
    });

    describe.concurrent("auto mode doesn't transform", () => {
      // TODO: figure out what to do with the following
      /*it("useEffect callbacks that use signals", async ({ expect }) => {
        const inputCode = `
				function App() {
					useEffect(() => {
						signal.value = <span>Hi</span>;
					}, []);
					return <div>Hello World</div>;
				}
			`;

        const expectedOutput = inputCode;
        await runTest(
          expect,
          inputCode,
          expectedOutput,
          TransformerTestOptions.makeFromMode(parser, "auto"),
          false,
          false
        );
      }); */

      runGeneratedTestCases({
        useValidAutoMode: false,
        expectTransformed: false,
        options: TransformerTestOptions.makeFromMode(parser, "auto"),
      });
    });

    describe.concurrent("auto mode supports opting out of transforming", () => {
      it("opt-out comment overrides opt-in comment", async () => {
        const inputCode = `
       	/**
       	 * @noTrackSignals
       	 * @trackSignals
       	 */
       	function MyComponent() {
       		return <div>{signal.value}</div>;
       	};
       `;
        const expectedOutput = inputCode;
        await runTest(
          expect,
          inputCode,
          expectedOutput,
          TransformerTestOptions.makeFromMode(parser, "auto"),
          false,
          true
        );
      });

      runGeneratedTestCases({
        useValidAutoMode: true,
        expectTransformed: false,
        comment: "opt-out",
        options: TransformerTestOptions.makeFromMode(parser, "auto"),
      });
    });

    describe.concurrent("auto mode supports opting into transformation", () => {
      runGeneratedTestCases({
        useValidAutoMode: false,
        expectTransformed: true,
        comment: "opt-in",
        compareWithoutComments: true,
        options: TransformerTestOptions.makeFromMode(parser, "auto"),
      });
    });

    describe.concurrent(
      "manual mode doesn't transform anything by default",
      () => {
        it("useEffect callbacks that use signals", async ({ expect }) => {
          const inputCode = `
				function App() {
					useEffect(() => {
						signal.value = <span>Hi</span>;
					}, []);
					return <div>Hello World</div>;
				}
			`;

          const expectedOutput = inputCode;
          await runTest(
            expect,
            inputCode,
            expectedOutput,
            TransformerTestOptions.makeFromMode(parser, "manual"),
            false,
            false
          );
        });

        runGeneratedTestCases({
          useValidAutoMode: true,
          expectTransformed: false,
          options: TransformerTestOptions.makeFromMode(parser, "manual"),
        });
      }
    );

    describe.concurrent("manual mode opts into transforming", () => {
      // TODO: Should throw an error
      it("opt-out comment overrides opt-in comment", async () => {
        const inputCode = `
      	/**
      	 * @noTrackSignals
      	 * @trackSignals
      	 */
      	function MyComponent() {
      		return <div>{signal.value}</div>;
      	};
      `;

        const expectedOutput = inputCode;

        await runTest(
          expect,
          inputCode,
          expectedOutput,
          TransformerTestOptions.makeFromMode(parser, "auto"),
          false,
          true
        );
      });

      runGeneratedTestCases({
        useValidAutoMode: true,
        expectTransformed: true,
        comment: "opt-in",
        compareWithoutComments: true,
        options: TransformerTestOptions.makeFromMode(parser, "manual"),
      });
    });

    describe.concurrent("imports before directives", () => {
      const inputCode = `
      'use client';
      'use strict';

			const MyComponent = () => {
				signal.value;
				return <div>Hello World</div>;
			};
    `;
      it("esm", async ({ expect }) => {
        const expectedOutput = `
      'use client';
      'use strict';

      import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
      const MyComponent = () => {
        var _effect = _useSignals();
        try {
          signal.value;
          return <div>Hello World</div>;
        } finally {
          _effect.f();
        }
      }
    `;

        await runTest(
          expect,
          inputCode,
          expectedOutput,
          TransformerTestOptions.makeFromMode(parser, "all"),
          false,
          false
        );
      });

      it("cjs", async ({ expect }) => {
        const expectedOutput = `
      'use client'; 
      'use strict';

      var _useSignals = require("@preact-signals/safe-react/tracking").useSignals;
      const MyComponent = () => {
        var _effect = _useSignals();
        try {
          signal.value;
          return <div>Hello World</div>;
        } finally {
          _effect.f();
        }
      };
    `;
        await runTest(
          expect,
          inputCode,
          expectedOutput,
          TransformerTestOptions.makeFromMode(parser, "all"),
          true,
          false
        );
      });
    });
  });

  describe.concurrent("all mode transformations " + parser, () => {
    it("skips transforming arrow function component with leading opt-out JSDoc comment before variable declaration", async ({
      expect,
    }) => {
      const inputCode = `
				/** @noTrackSignals */
				const MyComponent = () => {
					return <div>{signal.value}</div>;
				};
			`;

      const expectedOutput = inputCode;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        false,
        false
      );
    });

    it("skips transforming function declaration components with leading opt-out JSDoc comment", async ({
      expect,
    }) => {
      const inputCode = `
				/** @noTrackSignals */
				function MyComponent() {
					return <div>{signal.value}</div>;
				}
			`;

      const expectedOutput = inputCode;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        false,
        false
      );
    });

    it("transforms function declaration component that doesn't use signals", async ({
      expect,
    }) => {
      const inputCode = `
				function MyComponent() {
					return <div>Hello World</div>;
				}
			`;

      const expectedOutput = `
				import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
				function MyComponent() {
					var _effect = _useSignals();
					try {
						return <div>Hello World</div>;
					} finally {
						_effect.f();
					}
				}
			`;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        false,
        false
      );
    });

    it("transforms arrow function component with return statement that doesn't use signals", async ({
      expect,
    }) => {
      const inputCode = `
				const MyComponent = () => {
					return <div>Hello World</div>;
				};
			`;

      const expectedOutput = `
				import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
				const MyComponent = () => {
					var _effect = _useSignals();
					try {
						return <div>Hello World</div>;
					} finally {
						_effect.f();
					}
				};
			`;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        false,
        false
      );
    });

    it("transforms function declaration component that uses signals", async ({
      expect,
    }) => {
      const inputCode = `
				function MyComponent() {
					signal.value;
					return <div>Hello World</div>;
				}
			`;

      const expectedOutput = `
				import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
				function MyComponent() {
					var _effect = _useSignals();
					try {
						signal.value;
						return <div>Hello World</div>;
					} finally {
						_effect.f();
					}
				}
			`;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        false,
        false
      );
    });

    it("transforms arrow function component with return statement that uses signals", async ({
      expect,
    }) => {
      const inputCode = `
				const MyComponent = () => {
					signal.value;
					return <div>Hello World</div>;
				};
			`;

      const expectedOutput = `
				import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
				const MyComponent = () => {
					var _effect = _useSignals();
					try {
						signal.value;
						return <div>Hello World</div>;
					} finally {
						_effect.f();
					}
				};
			`;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        false,
        false
      );
    });

    it("transforms commonjs module exports", async ({ expect }) => {
      const inputCode = `
        require('preact');
        const MyComponent = () => {
          signal.value;
          return <div>Hello World</div>;
        }
      `;

      const expectedOutput = `
        var _useSignals = require("@preact-signals/safe-react/tracking").useSignals
        require('preact');
        const MyComponent = () => {
          var _effect = _useSignals();
          try {
            signal.value;
            return <div>Hello World</div>;
          } finally {
            _effect.f();
          }
        };
      `;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        TransformerTestOptions.makeFromMode(parser, "all"),
        true,
        false
      );
    });
  });

  // noTryFinally option removed for now

  describe("importSource option", () => {
    it("imports useSignals from custom source", async ({ expect }) => {
      const inputCode = `
				const MyComponent = () => {
					signal.value;
					return <div>Hello World</div>;
				};
			`;

      const expectedOutput = `
				import { useSignals as _useSignals } from "custom-source";
				const MyComponent = () => {
					var _effect = _useSignals();
					try {
						signal.value;
						return <div>Hello World</div>;
					} finally {
						_effect.f();
					}
				};
			`;

      await runTest(
        expect,
        inputCode,
        expectedOutput,
        {
          type: parser,
          options: {
            importSource: "custom-source",
          },
        },
        false,
        false
      );
    });
  });
}

describe("React Signals Babel Transform", () => {
  // hook tests removed for now
  // TODO: Figure out what to do with the following

  describe("scope tracking", () => {
    interface VisitorState {
      programScope?: Scope;
    }

    const programScopeVisitor: Visitor<VisitorState> = {
      Program: {
        exit(path, state) {
          state.programScope = path.scope;
        },
      },
    };

    function getRootScope(code: string) {
      const signalsPluginConfig: any[] = [signalsTransform];
      const result = transform(code, {
        ast: true,
        plugins: [signalsPluginConfig, "@babel/plugin-syntax-jsx"],
      });
      if (!result) {
        throw new Error("Could not transform code");
      }

      const state: VisitorState = {};
      // @ts-expect-error I dont know why this is erroring
      traverse(result.ast, programScopeVisitor, undefined, state);

      const scope = state.programScope;
      if (!scope) {
        throw new Error("Could not find program scope");
      }

      return scope;
    }

    it("adds newly inserted import declarations and usages to program scope", () => {
      const scope = getRootScope(`
				const MyComponent = () => {
					signal.value;
					return <div>Hello World</div>;
				};
			`);

      const signalsBinding = scope.bindings["_useSignals"];
      expect(signalsBinding).to.exist;
      expect(signalsBinding.kind).toEqual("module");
      expect(signalsBinding.referenced).toBeTruthy();
    });
  });
});
