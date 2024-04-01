import * as Babel from "@babel/standalone";
import { Editor, useMonaco } from "@monaco-editor/react";
import {
  $$,
  $state,
  $useLinkedState,
  $useState,
} from "@preact-signals/utils/macro";
import {
  computed,
  untracked,
  useSignalEffect,
} from "@preact-signals/safe-react";
import signalsTransformPlugin from "@preact-signals/safe-react/babel";
import macroTransformPlugin from "@preact-signals/utils/babel";
import { shikiToMonaco } from "@shikijs/monaco";
import { useEffect, useRef } from "react";
import { getHighlighter, codeToHtml } from "shiki";
import { resource } from "@preact-signals/utils";

const signalsTransformName = "signals-transform";
Babel.registerPlugin(signalsTransformName, signalsTransformPlugin);
const macroTransformName = "macro-transform";
Babel.registerPlugin(macroTransformName, macroTransformPlugin);

const defaultContent = `
import { $state } from '@preact-signals/utils/macro'

let text = $state('')

function App() {
  return (
    <div>
      <input value={text} onInput={(e) => (text = e.target.value)} />
      <p>{text}</p>
    </div>
  )
}
`;

const transformerConfig = $state({
  "Transform components": false,
  "Transform macros": true,
});
let text = $state(defaultContent);

const babelOutput = computed(() => {
  const plugins = [
    Babel.availablePlugins[signalsTransformName],
    [
      Babel.availablePlugins[macroTransformName],
      {
        experimental_stateMacros: true,
      },
    ],
  ];
  try {
    return {
      isError: false,
      value:
        Babel.transform(text, {
          presets: [Babel.availablePresets.env],
          plugins,
          filename: "out.mjs",
          parserOpts: {
            plugins: ["typescript", "jsx"],
          },
        }).code ?? "",
    } as const;
  } catch (e) {
    return {
      isError: true,
      value: e,
    } as const;
  }
});

const highlighter = resource({
  fetcher: async () => {
    const h = await getHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["tsx"],
    });
    console.log("h", h);
    await h.loadTheme("github-light");

    return h;
  },
});

const formattedHtml = resource({
  fetcher: ({ code, h }) => {
    if (!code) {
      return "";
    }

    return h.codeToHtml(code, {
      lang: "tsx",
      defaultColor: "dark",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  },
  source: () => {
    return babelOutput.value.isError || !highlighter.latest
      ? null
      : { code: babelOutput.value.value, h: highlighter.latest };
  },
});

const TransformedCode = () => {
  let divRef: HTMLDivElement | null = $useState(null);
  let dialogRef: HTMLDialogElement | null = $useState(null);

  useSignalEffect(() => {
    if (!divRef) {
      return;
    }
    divRef.innerHTML = formattedHtml() ?? "";
  });
  return (
    <>
      <div
        className="overflow-auto"
        ref={(ref) => {
          divRef = ref;
        }}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">
            Press ESC key or click the button below to close
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

function App() {
  const monaco = $useLinkedState(useMonaco());

  useSignalEffect(() => {
    const h = highlighter();
    if (!monaco || !h) {
      return;
    }

    monaco?.languages.register({ id: "tsx" });

    shikiToMonaco(h, monaco);
  });
  return (
    <div className="max-h-screen flex flex-col">
      <div>
        {$$(
          Object.entries(transformerConfig).map(([key, value]) => (
            <label className="label cursor-pointer" key={key}>
              <span className="label-text">{key}</span>
              <input
                onChange={() => {
                  // @ts-expect-error Object.entries
                  transformerConfig[key] = !value;
                }}
                type="checkbox"
                checked={value}
                className="checkbox"
              />
            </label>
          ))
        )}
      </div>
      <Editor
        height={500}
        options={{
          minimap: {
            enabled: false,
          },
        }}
        theme="github-dark"
        defaultLanguage="tsx"
        defaultValue={untracked(() => text)}
        onChange={(value) => (text = value ?? "")}
      />
      <br />

      <TransformedCode />
    </div>
  );
}

export default App;
