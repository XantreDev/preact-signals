import { it, describe } from "vitest";
import { format } from "prettier";
import { transform } from "@babel/core";
import preactSignalsUtilsBabel from "../babel";

describe.concurrent("@preact-signals/utils/macro", () => {
  const success = [
    [
      "ESM import",
      `
      import { $$ } from "@preact-signals/utils/macro";

      const a = $$(1)
    `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      const a = _$(() => 1);
    `,
    ],
    ["Transforms only resolved as macro: unresolved", `$$(10)`, `$$(10)`],
    [
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
      `,
    ],
    [
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
    `,
    ],
    [
      "CJS import",
      `
      const { $$ } = require("@preact-signals/utils/macro");

      const a = $$(1)
      `,
      `
      var _$ = require("@preact-signals/utils").$;
      const a = _$(() => 1);
      `,
      { isCJS: true },
    ],
    [
      "nested macro",
      `
      const {$$} = require("@preact-signals/utils/macro");

      $$($$(1))
      `,
      `
      import { $ as _$ } from "@preact-signals/utils";
      _$(() => _$(() => 1));
      `,
    ],
    [
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
        `,
    ],
    [
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
      `,
    ],
    [
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
      { isCJS: true },
    ],
  ] as const;

  for (const [name, input, output, options] of success) {
    it(name, async ({ expect }) => {
      expect(
        await format(
          transform(input, {
            plugins: [preactSignalsUtilsBabel],
            sourceType: options?.isCJS ? "script" : "module",
          })?.code!,
          { parser: "acorn" }
        )
      ).toEqual(await format(output, { parser: "acorn" }));
    });
  }
});
