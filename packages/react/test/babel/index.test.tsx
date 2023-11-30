import { transform, traverse } from "@babel/core";
import type { Visitor } from "@babel/core";
import type { Scope } from "@babel/traverse";
import prettier from "prettier";
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
import { expect, it, describe } from "vitest";

// To help interactively debug a specific test case, add the test ids of the
// test cases you want to debug to the `debugTestIds` array, e.g. (["258",
// "259"]). Set to true to debug all tests.
const DEBUG_TEST_IDS: string[] | true = [];

const format = (code: string) => prettier.format(code, { parser: "babel" });

function transformCode(
  code: string,
  options?: PluginOptions,
  filename?: string,
  isCJS?: boolean
) {
  const signalsPluginConfig: any[] = [signalsTransform];
  if (options) {
    signalsPluginConfig.push(options);
  }

  const result = transform(code, {
    filename,
    plugins: [signalsPluginConfig, "@babel/plugin-syntax-jsx"],
    sourceType: isCJS ? "script" : "module",
  });

  return result?.code || "";
}

async function runTest(
  input: string,
  expected: string,
  options: PluginOptions = { mode: "auto" },
  filename?: string,
  isCJS?: boolean
) {
  const output = transformCode(input, options, filename, isCJS);
  expect(await format(output)).to.equal(await format(expected));
}

interface TestCaseConfig {
  /** Whether to use components whose body contains valid code auto mode would transform (true) or not (false) */
  useValidAutoMode: boolean;
  /** Whether to assert that the plugin transforms the code (true) or not (false) */
  expectTransformed: boolean;
  /** What kind of opt-in or opt-out to include if any */
  comment?: CommentKind;
  /** Options to pass to the babel plugin */
  options: PluginOptions;
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

    it(`(${testId}) ${testCase.name}`, async () => {
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

      await runTest(input, expected, config.options, filename);
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

describe("React Signals Babel Transform", () => {
  describe("auto mode transforms", () => {
    runGeneratedTestCases({
      useValidAutoMode: true,
      expectTransformed: true,
      options: { mode: "auto" },
    });
  });

  describe("auto mode doesn't transform", () => {
    it("useEffect callbacks that use signals", async () => {
      const inputCode = `
				function App() {
					useEffect(() => {
						signal.value = <span>Hi</span>;
					}, []);
					return <div>Hello World</div>;
				}
			`;

      const expectedOutput = inputCode;
      await runTest(inputCode, expectedOutput);
    });

    runGeneratedTestCases({
      useValidAutoMode: false,
      expectTransformed: false,
      options: { mode: "auto" },
    });
  });

  describe("auto mode supports opting out of transforming", () => {
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

      await runTest(inputCode, expectedOutput, { mode: "auto" });
    });

    runGeneratedTestCases({
      useValidAutoMode: true,
      expectTransformed: false,
      comment: "opt-out",
      options: { mode: "auto" },
    });
  });

  describe("auto mode supports opting into transformation", () => {
    runGeneratedTestCases({
      useValidAutoMode: false,
      expectTransformed: true,
      comment: "opt-in",
      options: { mode: "auto" },
    });
  });

  describe("manual mode doesn't transform anything by default", () => {
    it("useEffect callbacks that use signals", async () => {
      const inputCode = `
				function App() {
					useEffect(() => {
						signal.value = <span>Hi</span>;
					}, []);
					return <div>Hello World</div>;
				}
			`;

      const expectedOutput = inputCode;
      await runTest(inputCode, expectedOutput);
    });

    runGeneratedTestCases({
      useValidAutoMode: true,
      expectTransformed: false,
      options: { mode: "manual" },
    });
  });

  describe("manual mode opts into transforming", () => {
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

      await runTest(inputCode, expectedOutput, { mode: "auto" });
    });

    runGeneratedTestCases({
      useValidAutoMode: true,
      expectTransformed: true,
      comment: "opt-in",
      options: { mode: "manual" },
    });
  });
});

// TODO: migrate hook tests

describe("React Signals Babel Transform", () => {
  // describe("auto mode transformations", () => {
  //   it("transforms custom hook arrow functions with return statement", async () => {
  //     const inputCode = `
  // 			const useCustomHook = () => {
  // 				return signal.value;
  // 			};
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			const useCustomHook = () => {
  // 				_useSignals();
  // 				return signal.value;
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput);
  //   });

  //   it("transforms custom hook arrow functions with inline return statement", async () => {
  //     const inputCode = `
  // 			const useCustomHook = () => name.value;
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			const useCustomHook = () => {
  // 				_useSignals();
  // 				return name.value;
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput);
  //   });

  //   it("transforms custom hook function declarations", async () => {
  //     const inputCode = `
  // 			function useCustomHook() {
  // 				return signal.value;
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			function useCustomHook() {
  // 				_useSignals();
  // 				return signal.value;
  // 			}
  // 		`;

  //     await runTest(inputCode, expectedOutput);
  //   });

  //   it("transforms custom hook function expressions", async () => {
  //     const inputCode = `
  // 			const useCustomHook = function () {
  // 				return signal.value;
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			const useCustomHook = function () {
  // 				_useSignals();
  // 				return signal.value;
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput);
  //   });
  // });

  // describe("manual mode opt-in transformations", () => {
  //   it("transforms custom hook arrow function with leading opt-in JSDoc comment before variable declaration", async () => {
  //     const inputCode = `
  // 			/** @trackSignals */
  // 			const useCustomHook = () => {
  // 				return useState(0);
  // 			};
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			/** @trackSignals */
  // 			const useCustomHook = () => {
  // 				_useSignals();
  // 				return useState(0);
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput, { mode: "manual" });
  //   });

  //   it("transforms custom hook exported as default function declaration with leading opt-in JSDoc comment", async () => {
  //     const inputCode = `
  // 			/** @trackSignals */
  // 			export default function useCustomHook() {
  // 				return useState(0);
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			/** @trackSignals */
  // 			export default function useCustomHook() {
  // 				_useSignals();
  // 				return useState(0);
  // 			}
  // 		`;

  //     await runTest(inputCode, expectedOutput, { mode: "manual" });
  //   });

  //   it("transforms custom hooks exported as named function declaration with leading opt-in JSDoc comment", async () => {
  //     const inputCode = `
  // 			/** @trackSignals */
  // 			export function useCustomHook() {
  // 				return useState(0);
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			/** @trackSignals */
  // 			export function useCustomHook() {
  // 				_useSignals();
  // 				return useState(0);
  // 			}
  // 		`;

  //     await runTest(inputCode, expectedOutput, { mode: "manual" });
  //   });
  // });

  // describe("auto mode opt-out transformations", () => {
  //   it("skips transforming custom hook arrow function with leading opt-out JSDoc comment before variable declaration", async () => {
  //     const inputCode = `
  // 			/** @noTrackSignals */
  // 			const useCustomHook = () => {
  // 				return useState(0);
  // 			};
  // 		`;

  //     const expectedOutput = inputCode;

  //     await runTest(inputCode, expectedOutput, { mode: "auto" });
  //   });

  //   it("skips transforming custom hooks exported as default function declaration with leading opt-out JSDoc comment", async () => {
  //     const inputCode = `
  // 			/** @noTrackSignals */
  // 			export default function useCustomHook() {
  // 				return useState(0);
  // 			}
  // 		`;

  //     const expectedOutput = inputCode;

  //     await runTest(inputCode, expectedOutput, { mode: "auto" });
  //   });

  //   it("skips transforming custom hooks exported as named function declaration with leading opt-out JSDoc comment", async () => {
  //     const inputCode = `
  // 			/** @noTrackSignals */
  // 			export function useCustomHook() {
  // 				return useState(0);
  // 			}
  // 		`;

  //     const expectedOutput = inputCode;

  //     await runTest(inputCode, expectedOutput, { mode: "auto" });
  //   });
  // });

  // describe("auto mode no transformations", () => {
  //   it("skips transforming custom hook function declarations that don't use signals", async () => {
  //     const inputCode = `
  // 			function useCustomHook() {
  // 				return useState(0);
  // 			}
  // 		`;

  //     const expectedOutput = inputCode;
  //     await runTest(inputCode, expectedOutput);
  //   });

  //   it("skips transforming custom hook function declarations incorrectly named", async () => {
  //     const inputCode = `
  // 			function usecustomHook() {
  // 				return signal.value;
  // 			}
  // 		`;

  //     const expectedOutput = inputCode;
  //     await runTest(inputCode, expectedOutput);
  //   });
  // });

  // TODO: Figure out what to do with the following

  describe("all mode transformations", () => {
    it("skips transforming arrow function component with leading opt-out JSDoc comment before variable declaration", async () => {
      const inputCode = `
				/** @noTrackSignals */
				const MyComponent = () => {
					return <div>{signal.value}</div>;
				};
			`;

      const expectedOutput = inputCode;

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });

    it("skips transforming function declaration components with leading opt-out JSDoc comment", async () => {
      const inputCode = `
				/** @noTrackSignals */
				function MyComponent() {
					return <div>{signal.value}</div>;
				}
			`;

      const expectedOutput = inputCode;

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });

    it("transforms function declaration component that doesn't use signals", async () => {
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

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });

    it("transforms arrow function component with return statement that doesn't use signals", async () => {
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

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });

    it("transforms function declaration component that uses signals", async () => {
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

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });

    it("transforms arrow function component with return statement that uses signals", async () => {
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

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });

    it("transforms commonjs module exports", async () => {
      const inputCode = `
        require('preact');
        const MyComponent = () => {
          signal.value;
          return <div>Hello World</div>;
        }
      `;

      const expectedOutput = `
        var _preactSignalsSafeReactTracking = require("@preact-signals/safe-react/tracking")
        require('preact');
        const MyComponent = () => {
          var _effect = _preactSignalsSafeReactTracking.useSignals();
          try {
            signal.value;
            return <div>Hello World</div>;
          } finally {
            _effect.f();
          }
        };
      `;

      await runTest(inputCode, expectedOutput, { mode: "all" }, "", true);
    });

    it("should not transform components wrapped in HOCs", async () => {
      const inputCode = `
        const MyComponent = React.memo(() => {
          signal.value;
          return <div>Hello World</div>;
        })
      `;

      const expectedOutput = `
        const MyComponent = React.memo(() => {
          signal.value;
          return <div>Hello World</div>;
        })
      `;

      await runTest(inputCode, expectedOutput, { mode: "all" });
    });
  });

  // describe("noTryFinally option", () => {
  //   it("prepends arrow function component with useSignals call", async () => {
  //     const inputCode = `
  // 			const MyComponent = () => {
  // 				signal.value;
  // 				return <div>Hello World</div>;
  // 			};
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			const MyComponent = () => {
  // 				_useSignals();
  // 				signal.value;
  // 				return <div>Hello World</div>;
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput, {
  //       experimental: { noTryFinally: true },
  //     });
  //   });

  //   it("prepends arrow function component with useSignals call", async () => {
  //     const inputCode = `
  // 			const MyComponent = () => <div>{name.value}</div>;
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			const MyComponent = () => {
  // 				_useSignals();
  // 				return <div>{name.value}</div>;
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput, {
  //       experimental: { noTryFinally: true },
  //     });
  //   });

  //   it("prepends function declaration components with useSignals call", async () => {
  //     const inputCode = `
  // 			function MyComponent() {
  // 				signal.value;
  // 				return <div>Hello World</div>;
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			function MyComponent() {
  // 				_useSignals();
  // 				signal.value;
  // 				return <div>Hello World</div>;
  // 			}
  // 		`;

  //     await runTest(inputCode, expectedOutput, {
  //       experimental: { noTryFinally: true },
  //     });
  //   });

  //   it("prepends function expression components with useSignals call", async () => {
  //     const inputCode = `
  // 			const MyComponent = function () {
  // 				signal.value;
  // 				return <div>Hello World</div>;
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			const MyComponent = function () {
  // 				_useSignals();
  // 				signal.value;
  // 				return <div>Hello World</div>;
  // 			};
  // 		`;

  //     await runTest(inputCode, expectedOutput, {
  //       experimental: { noTryFinally: true },
  //     });
  //   });

  //   it("prepends custom hook function declarations with useSignals call", async () => {
  //     const inputCode = `
  // 			function useCustomHook() {
  // 				signal.value;
  // 				return useState(0);
  // 			}
  // 		`;

  //     const expectedOutput = `
  // 			import { useSignals as _useSignals } from "@preact-signals/safe-react/tracking";
  // 			function useCustomHook() {
  // 				_useSignals();
  // 				signal.value;
  // 				return useState(0);
  // 			}
  // 		`;

  //     await runTest(inputCode, expectedOutput, {
  //       experimental: { noTryFinally: true },
  //     });
  //   });
  // });

  describe("importSource option", () => {
    it("imports useSignals from custom source", async () => {
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

      await runTest(inputCode, expectedOutput, {
        importSource: "custom-source",
      });
    });
  });

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
