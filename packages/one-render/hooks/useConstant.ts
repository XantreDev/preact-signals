import { useState } from "react";

export const useConstant = <T>(initCallback: () => T) =>
  useState(initCallback)[0];
