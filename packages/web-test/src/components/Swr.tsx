import { hookScope, withOneRender } from "@/core";
import { useState } from "react";
import { useTodoQuery } from "../hooks/useTodoQuery";

export const Swr = withOneRender(() => {
  hookScope(() => {
    useState();
  });

  hookScope(() => {
    console.log(useTodoQuery().data);
  });
  return null;
});
