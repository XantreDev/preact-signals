import { it, describe, Test } from "vitest";
import { format as _format } from "prettier";
import { transform } from "@babel/core";
import preactSignalsUtilsBabel, {
  type BabelMacroPluginOptions,
  SyntaxErrorWithLoc,
} from "../babel";

const transformFromOptions = (testCase: TestCase) =>
  transform(testCase.input, {
    presets: testCase.usePresetEnv ? presetEnvConfig : undefined,
    parserOpts: {
      plugins: (
        [
          testCase.typescript ? "typescript" : null,
          testCase.jsx ? "jsx" : null,
        ] as const
      ).filter(<T>(it: T): it is Exclude<T, null> => it !== null),
    },
    plugins: [[preactSignalsUtilsBabel, testCase.options]],
    sourceType: testCase.isCJS ? "script" : "module",
  })?.code!;

const transformAndFormatFromOptions = (testCase: TestCase) =>
  _format(transformFromOptions(testCase), {
    parser: testCase.typescript ? "babel-ts" : "acorn",
  });

class TestCase {
  public isCJS: boolean;
  public usePresetEnv: boolean;
  public typescript: boolean;
  public jsx: boolean;
  public options: BabelMacroPluginOptions;
  public name: string;
  public input: string;

  private constructor(name: string, input: string) {
    this.name = name;
    this.input = input;
    this.isCJS = false;
    this.usePresetEnv = false;
    this.typescript = false;
    this.jsx = false;
    this.options = {
      experimental_stateMacros: true,
      experimental_stateMacrosOptimization: false,
    };
  }

  setIsCJS(isCJS: boolean) {
    this.isCJS = isCJS;
    return this;
  }

  setUsePresetEnv(usePresetEnv: boolean) {
    this.usePresetEnv = usePresetEnv;
    return this;
  }

  setTypescript(typescript: boolean) {
    this.typescript = typescript;
    return this;
  }
  setJSX(jsx: boolean) {
    this.jsx = jsx;
    return this;
  }

  setOptions(options: BabelMacroPluginOptions) {
    this.options = options;
    return this;
  }

  turnOnAllStateMacroFeatures() {
    this.setOptions({
      experimental_stateMacros: true,
      experimental_stateMacrosOptimization: true,
    });
    return this;
  }

  static make(name: string, input: string): TestCase {
    return new TestCase(name, input);
  }
}

const presetEnvConfig = [
  [
    "@babel/preset-env",
    {
      targets: "node 20.0",
    },
  ],
];

describe.concurrent("@preact-signals/utils/macro", () => {
  const success = [
    TestCase.make(
      "ESM import",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(1)
    `
    ),
    TestCase.make(
      "Working inside of scopes",
      `
      import { $$ } from "@preact-signals/utils/macro";

      $$(10)
      {
        const a = $$(1)
        
        const $$ = 0
        
        console.log($$)
      }
      `
    ),
    TestCase.make("Transforms only resolved as macro: unresolved", `$$(10)`),
    TestCase.make(
      "Must remove import event if not used",
      `
      import { $$ } from "@preact-signals/utils/macro";
      `
    ),
    TestCase.make(
      "Transforms only resolved as macro: declared",
      `
      import {$$} from "@preact-signals/utils/macro";
      $$(10)
      {
        const $$ = () => 10;
        $$(10)
      }
      `
    ),
    TestCase.make(
      "Correctly handles braces in arrow function if using object",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$({ a: 1 })
    `
    ),
    TestCase.make(
      "CJS import",
      `
      const { $$ } = require("@preact-signals/utils/macro");

      const a = $$(1)
      `
    ).setIsCJS(true),
    TestCase.make(
      "CJS import with multiple imports",
      `
      const { $$, $useState } = require("@preact-signals/utils/macro");
      $$(10)
      `
    )
      .setIsCJS(true)
      .setOptions({
        experimental_stateMacros: false,
        experimental_stateMacrosOptimization: false,
      }),
    TestCase.make(
      "nested macro",
      `
      const {$$} = require("@preact-signals/utils/macro");

      $$($$(1))
      `
    ),
    TestCase.make(
      "is not breaking directives",
      `
        'use client';
        'use strict';
        
        import { $$ } from "@preact-signals/utils/macro";

        const a = $$(1)
      `
    ),
    TestCase.make(
      "is not break other imports",
      `
        import React from 'react';
        import {readFileSync} from 'fs';
        import * as path from 'path';
      `
    ),
    TestCase.make(
      "is not break other imports (CJS)",
      `
        const React = require('react');
        const {readFileSync} = require('fs');
        const path = require('path');
      `
    ).setIsCJS(true),
    TestCase.make(
      "Replaces $useState references",
      `
      import { $useState, $useLinkedState } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $useState(0)
        let b = $useState(0)
        const c = $useLinkedState(0)
        a += 10
        a.value += 10
        a
        a.value
        
        b += 10
        c.value += 10
      }
      `
    ),
    TestCase.make(
      "Correctly work with references in object shorthand",
      `
      import { $useState } from "@preact-signals/utils/macro";

      const _ = () => {
        let a = $useState(0)
        let b = $useState(0)
        const c = $useState(0)
        return { a, b, c }
      }
      `
    ),
    TestCase.make(
      "Top level macro works",
      `
      import { $state } from "@preact-signals/utils/macro";

      let a = $state(0)

      effect(() => {
        console.log(a)
      })
      a += 10
      `
    ),
    TestCase.make(
      "$derived transforms correctly",
      `
      import { $derived } from '@preact-signals/utils/macro'
      
      const state = $derived(10)
      `
    ),
    TestCase.make(
      "$useDerived transforms correctly",
      `
      import { $useDerived } from '@preact-signals/utils/macro'

      const _ = () => {
        const state = $useDerived(10)
      }
      `
    ),
    TestCase.make(
      "State macro inside of ref macro",
      `
      import { $$, $state } from '@preact-signals/utils/macro'

      let a = $state(10)
      
      $$(a)
      `
    ),
    TestCase.make(
      "Ref macro inside of state macro",
      `
      import { $$, $state } from '@preact-signals/utils/macro'

      let a = $state(10)
      let b = $state($$(a))
      `
    ),
    TestCase.make(
      "Deref is working",
      `
      import { $state, $deref } from '@preact-signals/utils/macro'

      let a = $state(10)
      const aSig = $deref(a)
    `
    ),
    TestCase.make(
      "Allows to export types",
      `
      export type * from '@preact-signals/utils/macro'
      export type { a } from '@preact-signals/utils/macro'
      export { type a } from '@preact-signals/utils/macro'
    `
    ).setTypescript(true),
    TestCase.make(
      "Should transform by preset-env correctly",
      `
      import { $derived, $$ } from '@preact-signals/utils/macro'
      
      const state = $derived(10)
      $$(10)
    `
    ).setUsePresetEnv(true),
    TestCase.make(
      "Should optimize JSX",
      `
      import { $state } from '@preact-signals/utils/macro'
      
      const a = $state(10)

      const b = <>{a}</>
      `
    )
      .turnOnAllStateMacroFeatures()
      .setJSX(true),
    TestCase.make(
      "Should now fail on complex JSX",
      `
      import { $state } from '@preact-signals/utils/macro'
      
      const a = $state(10)

      const b = <>{a * 10}</>
     `
    )
      .turnOnAllStateMacroFeatures()
      .setJSX(true),

    TestCase.make(
      "Should now fail on complex JSX",
      `
      import { $state } from '@preact-signals/utils/macro'
      
      let a = $state(10)
      let b = $state(20)

      const c = <>{a * b + 10}</>
      const d = <>{() => a}</>
     `
    )
      .turnOnAllStateMacroFeatures()
      .setJSX(true),
    TestCase.make(
      "Should not wrap hooks",
      `
      import { $state } from '@preact-signals/utils/macro'
      import { useRef } from 'react'

      
      let a = $state(0)
      
      const Component = () => {
        return <>{useRef(a).current}</>
      }      
      `
    )
      .turnOnAllStateMacroFeatures()
      .setJSX(true),
  ];

  for (const testCase of success) {
    it(testCase.name, async ({ expect }) => {
      expect(await transformAndFormatFromOptions(testCase)).toMatchSnapshot();
    });
  }
  const fail = [
    TestCase.make(
      "Throws error if not a CallExpression",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$;
    `
    ),
    TestCase.make(
      "Throws error if callExpression called with multiple arguments",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(1, 2);
    `
    ),
    TestCase.make(
      "Throws error if callExpression called with no arguments",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$();
    `
    ),
    TestCase.make(
      "Throws error if used with spread argument",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(...[1]);
    `
    ),
    TestCase.make(
      "Throws error if `$useState` used with var for variable declaration",
      `
      import { $useState } from "@preact-signals/utils/macro";
      const _ = () => {
        var a = $useState(0)
      }
      `
    ),
    TestCase.make(
      "Throws error if using $useState outside of function",
      `
      import { $useState } from "@preact-signals/utils/macro";
      let a = $useState(0)
      `
    ),
    TestCase.make(
      "Cannot use * as declaration",
      `
      import * as macro from "@preact-signals/utils/macro";

      const a = macro.$$(1)
      `
    ),
    TestCase.make(
      "CJS cannot rest pattern in require",
      `
      const { $$, ...a } = require("@preact-signals/utils/macro");`
    ).setIsCJS(true),
    TestCase.make(
      "Throws error if $linkedState assigned to a variable",
      `
      import { $useLinkedState } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $useLinkedState(0)
        a += 10
      }
      `
    ),
    // TODO: throw even has no import of known macro
    TestCase.make(
      "Throws if imports unknown macro",
      `
      import { $unknown, $$ } from "@preact-signals/utils/macro";
      `
    ),
    // TODO: throw even has no import of known macro
    TestCase.make(
      "Throws if imports unknown macro (CJS)",
      `
      const { $unknown, $$ } = require("@preact-signals/utils/macro")
      `
    ),
    TestCase.make(
      "Throws if state macros is used outside of variable declaration ($useState)",
      `
      import { $useState } from "@preact-signals/utils/macro";
      const _ = () => {
        $useState(0)
      }`
    ),
    TestCase.make(
      "Throws if state macros is used outside of variable declaration ($useLinkedState)",
      `
      import { $useLinkedState, $useState } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $useState(0)
        $useLinkedState(0)
      }`
    ),
    TestCase.make(
      "Throws if state macros uses let for linked state",
      `
      import { $useLinkedState } from "@preact-signals/utils/macro";
      const _ = () => {
        let a = $useLinkedState(0)
      }`
    ),
    TestCase.make(
      "Throws if top level macro exported from module (inline export)",
      `
      import { $state } from "@preact-signals/utils/macro";

      export let a = $state(0)
      `
    ),
    TestCase.make(
      "Should throw if trying to export macro",
      `
      import { $state } from "@preact-signals/utils/macro";

      export { $state }
      `
    ),
    TestCase.make(
      "Should throw on reexport (all)",
      `
      export * from "@preact-signals/utils/macro";
      `
    ),
    TestCase.make(
      "Should throw on reexport (one)",
      `
      export { $state } from "@preact-signals/utils/macro";
      `
    ),
    TestCase.make(
      "Throws if top level macro exported from module (statement export)",
      `
      const { $state } = require("@preact-signals/utils/macro");

      let a = $state(0)

      export { a }
      `
    ),
    TestCase.make(
      "Throws if linked state assigned",
      `
      import {$useLinkedState} from '@preact-signals/utils/macro'
      
      const _ = () => {
        const a = $useLinkedState(10)
        
        a += 20
        a = 20
      }
    `
    ),
    ...["$derived", "$useDerived"].map((it) =>
      TestCase.make(
        `Throws if ${it} state is ressigned`,
        `
      import {${it}} from '@preact-signals/utils/macro'
      
      const _ = () => {
        const a = ${it}(10)
        
        a += 20
        a = 20
      }
      `
      )
    ),
    TestCase.make(
      "Throws if state is reassigned",
      `
      import { $state } from "@preact-signals/utils/macro";

      const a = $state(0)
      a = 10
      `
    ),

    TestCase.make(
      "It must be imposible to deref regular var",
      `
      import { $state, $deref } from "@preact-signals/utils/macro";

      const a = 10
      const b = $deref(a)
      `
    ),
  ];

  for (const testCase of fail) {
    it(testCase.name, async ({ expect }) => {
      expect(() => {
        transformFromOptions(testCase);
        // @ts-expect-error private constructor is a shit show
      }).toThrowError(SyntaxErrorWithLoc);
    });
  }
});
