import { useSignalEffectOnce } from "@preact-signals/hooks";
import { untracked } from "@preact-signals/utils";
import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { QueryClientProvider } from "../react-query";
import { useQuery$ } from "../useQuery$";
import {
  createHooksComponentElement,
  createQueryClient,
  fetchTime,
  queryKey,
  queueSignal,
  renderWithClient,
  sleep,
} from "./utils";

describe("useQuery$()", () => {
  it("should fetch", async () => {
    const key = queryKey();
    const queryFn = vi.fn(fetchTime(10));
    const { dispose, emit, queue } = queueSignal();
    renderWithClient(
      createQueryClient(),
      <>
        {createHooksComponentElement(() => {
          const data = useQuery$(() => ({
            queryKey: key,
            queryFn,
          }));
          emit(untracked(() => data.data));
          useSignalEffectOnce(() => {
            emit(data.data);
          });
        })}
      </>
    );

    expect(queue).toEqual([undefined]);
    await sleep(20);
    expect(queue).toEqual([undefined, "data"]);
    expect(queryFn).toHaveBeenCalledTimes(1);
    dispose();
  });
  it("should react to swap of query client", async () => {
    const key = queryKey();

    const queryFn = vi.fn(fetchTime(10));
    const { dispose, emit, queue } = queueSignal();
    const firstClient = createQueryClient();
    const secondClient = createQueryClient();
    const content = createHooksComponentElement(() => {
      const data = useQuery$(() => ({
        queryKey: key,
        queryFn,
      }));

      emit(untracked(() => data.data));
      useSignalEffectOnce(() => {
        emit(data.data);
      });
    });
    const { rerender } = render(
      <QueryClientProvider client={firstClient}>{content}</QueryClientProvider>
    );

    expect(queue).toEqual([undefined]);
    await sleep(20);
    expect(queue).toEqual([undefined, "data"]);

    rerender(
      <QueryClientProvider client={secondClient}>{content}</QueryClientProvider>
    );
    await sleep(20);
    expect(queue).toEqual([undefined, "data", undefined, "data"]);
    expect(queryFn).toHaveBeenCalledTimes(2);
    dispose();
  });
});
