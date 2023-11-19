import { signal, useSignalEffect } from "../../src/lib";
import { renderToStaticMarkup } from "react-dom/server";
import { mountSignalsTests } from "../shared/mounting";
import { vi, describe, it, expect } from "vitest";
import React from "react";

describe("renderToStaticMarkup", () => {
  mountSignalsTests(renderToStaticMarkup);

  it("should not invoke useSignalEffect", async () => {
    const spy = vi.fn();
    const sig = signal("foo");

    function App() {
      useSignalEffect(() => spy(sig.value));
      return <p>{sig.value}</p>;
    }

    const html = await renderToStaticMarkup(<App />);
    expect(html).to.equal("<p>foo</p>");
    expect(spy).not.toHaveBeenCalled();
  });
});
