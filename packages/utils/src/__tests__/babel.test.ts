import { it, describe } from "vitest";
import { format as _format } from "prettier";
import { transform } from "@babel/core";
import preactSignalsUtilsBabel, { BabelMacroPluginOptions } from "../babel";

const format = (code: string) => _format(code, { parser: "acorn" });

type TestCase = {
  name: string;
  input: string;
  output: string;
  isCJS: boolean;
  options: BabelMacroPluginOptions | undefined;
};
const TestCase = {
  make: (name: string, input: string, output: string): TestCase =>
    TestCase.makeConfigurable(name, input, output, {}),
  makeConfigurable: (
    name: string,
    input: string,
    output: string,
    params: Partial<Omit<TestCase, "input" | "output">>
  ): TestCase => ({
    name,
    input,
    output,
    isCJS: params.isCJS ?? false,
    options: params.options,
  }),
};

describe.concurrent("@preact-signals/utils/macro", () => {
  const success = [
    TestCase.make(
      "ESM import",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(1)
    `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      const a = _$(() => 1);
    `
    ),
    TestCase.make(
      ...["Transforms only resolved as macro: unresolved", `$$(10)`, `$$(10)`]
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
      `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      _$(() => 10);
      {
        const $$ = () => 10;
        $$(10);
      }
      `
    ),
    TestCase.make(
      "Correctly handles braces in arrow function if using object",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$({ a: 1 })
    `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      const a = _$(() => ({
        a: 1,
      }));
    `
    ),
    TestCase.makeConfigurable(
      "CJS import",
      `
      const { $$ } = require("@preact-signals/utils/macro");

      const a = $$(1)
      `,
      `
      var _$ = require("@preact-signals/utils").$;
      const a = _$(() => 1);
      `,
      { isCJS: true }
    ),
    TestCase.make(
      "nested macro",
      `
      const {$$} = require("@preact-signals/utils/macro");

      $$($$(1))
      `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      _$(() => _$(() => 1));
      `
    ),
    TestCase.make(
      "is not breaking directives",
      `
        'use client';
        'use strict';
        
        import { $$ } from "@preact-signals/utils/macro";

        const a = $$(1)
      `,
      `
        'use client';
        'use strict';
        
        import { $ as _$ } from "@preact-signals/utils";
        const a = _$(() => 1)
        `
    ),
    TestCase.make(
      "is not break other imports",
      `
        import React from 'react';
        import {readFileSync} from 'fs';
        import * as path from 'path';
      `,
      `
        import React from 'react';
        import {readFileSync} from 'fs';
        import * as path from 'path';
      `
    ),
    TestCase.makeConfigurable(
      "is not break other imports (CJS)",
      `
        const React = require('react');
        const {readFileSync} = require('fs');
        const path = require('path');
      `,
      `
        const React = require('react');
        const {readFileSync} = require('fs');
        const path = require('path');
      `,
      { isCJS: true }
    ),
    TestCase.makeConfigurable(
      "Replaces $state references",
      `
      let a = $state(0)
      a += 10
      a.value += 10
      a
      a.value
      `,
      `
      let a = $state(0)
      a.value += 10
      a.value.value += 10
      a.value
      a.value.value
      `,
      {
        options: {
          enableStateMacros: true,
        },
      }
    ),
  ];

  for (const { input, isCJS, name, options, output } of success) {
    it(name, async ({ expect }) => {
      expect(
        await format(
          transform(input, {
            plugins: [[preactSignalsUtilsBabel, options]],
            sourceType: isCJS ? "script" : "module",
          })?.code!
        )
      ).toEqual(await format(output));
    });
  }
});
