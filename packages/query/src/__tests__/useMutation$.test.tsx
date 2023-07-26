import { useEffect } from "react";
import { describe, vi } from "vitest";
import { useMutation$ } from "../useMutation$";
import {
  createHooksComponentElement,
  createQueryClient,
  queueSignal,
  renderWithClient,
  sleep,
} from "./utils";

describe("useMutation$()", () => {
  it("should mutate", async () => {
    const mutationFn = vi.fn(() => Promise.resolve("data"));
    const onSuccess = vi.fn<[]>();
    const onRender = vi.fn();
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const mutation = useMutation$(() => ({
            mutationFn: () => mutationFn(),
            onSuccess,
          }));
          // should not re-render
          onRender();

          useEffect(() => {
            mutation.mutate();
          }, []);
        })}
      </>
    );

    await sleep(1);
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("should rerender if subscribed", async () => {
    const mutationFn = vi.fn(() => Promise.resolve("data"));
    const onSuccess = vi.fn<[]>();
    const { queue, emit, dispose } = queueSignal();
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const mutation = useMutation$(() => ({
            mutationFn: () => mutationFn(),
            onSuccess,
          }));
          // subscribing to mutation
          emit(mutation.status);

          useEffect(() => {
            mutation.mutate();
          }, []);
        })}
      </>
    );

    await sleep(2);
    expect(queue).toEqual(["idle", "loading", "success"]);
    expect(mutationFn).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    dispose();
  });
});
