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
