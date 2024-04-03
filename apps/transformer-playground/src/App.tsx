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
  effect,
  ReadonlySignal,
  untracked,
  useSignalEffect,
} from "@preact-signals/safe-react";
import signalsTransformPlugin from "@preact-signals/safe-react/babel";
import macroTransformPlugin from "@preact-signals/utils/babel";
import { shikiToMonaco } from "@shikijs/monaco";
import { getHighlighter } from "shiki";
import { resource } from "@preact-signals/utils";

const signalsTransformName = "signals-transform";
Babel.registerPlugin(signalsTransformName, signalsTransformPlugin);
const macroTransformName = "macro-transform";
Babel.registerPlugin(macroTransformName, macroTransformPlugin);

const getFromLocalStorage = (): string | null => localStorage.getItem("input");
const setToLocalStorage = (code: string) => localStorage.setItem("input", code);

const defaultContent =
  getFromLocalStorage() ??
  `\
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

effect(() => {
  setToLocalStorage(text);
});

const babelOutput = computed(() => {
  const plugins = [
    transformerConfig["Transform components"] &&
      Babel.availablePlugins[signalsTransformName],
    transformerConfig["Transform macros"] && [
      Babel.availablePlugins[macroTransformName],
      {
        experimental_stateMacros: true,
      },
    ],
  ].filter(Boolean);
  try {
    return {
      isError: false,
      value:
        Babel.transform(text, {
          // presets: [Babel.availablePresets.env],
          // @ts-expect-error filter(Boolean)
          plugins,
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

const ErrorDialog = ({
  className,
  error,
}: {
  error: ReadonlySignal<string | null>;
  className?: string;
}) => {
  return (
    <div
      className={[className ?? "", !error.value && "pointer-events-none"].join(
        " "
      )}
    >
      <input
        type="checkbox"
        readOnly
        checked={!!error.value}
        className="modal-toggle"
      />
      <div className="modal absolute">
        <div className="modal-box">
          <p className="py-4">{error}</p>
        </div>
      </div>
    </div>
  );
};

const TransformedCode = () => {
  let divRef: HTMLDivElement | null = $useState(null);

  useSignalEffect(() => {
    if (!divRef) {
      return;
    }
    divRef.innerHTML = formattedHtml() ?? "";
  });
  useSignalEffect(() => {
    const error = babelOutput.value.isError && babelOutput.value.value;

    if (error) {
      console.error(error);
    }
  });
  return (
    <div className="overflow-auto relative flex flex-col w-full h-full">
      Output:
      <div
        className="overflow-auto flex-1"
        ref={(ref) => {
          divRef = ref;
        }}
      />
      <ErrorDialog
        error={$$(
          babelOutput.value.isError ? String(babelOutput.value.value) : null
        )}
        className="absolute inset-0"
      />
    </div>
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
    <div className="max-h-screen h-screen flex flex-col flex-1">
      <div className="flex gap-4 items-center px-4">
        Settings:
        {$$(
          Object.entries(transformerConfig).map(([key, value]) => (
            <label className="label gap-2 cursor-pointer" key={key}>
              <input
                onChange={() => {
                  // @ts-expect-error Object.entries
                  transformerConfig[key] = !value;
                }}
                type="checkbox"
                checked={value}
                className="checkbox"
              />
              <span className="label-text">{key}</span>
            </label>
          ))
        )}
      </div>
      <Editor
        height={"60%"}
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

      <TransformedCode />
    </div>
  );
}

export default App;
