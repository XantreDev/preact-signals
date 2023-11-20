module.exports = /** @type {import('@babel/core').TransformOptions} */ ({
  presets: ["next/babel"],
  overrides: [
    {
      exclude: /node_modules/,
      presets: ["next/babel"],
      plugins: [
        [
          "module:@preact-signals/safe-react/babel",
          {
            mode: "auto",
          },
        ],
        ,
      ],
    },
  ],
});
