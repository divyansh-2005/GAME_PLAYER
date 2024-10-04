import { useContext } from "react";
import { TmaContext } from "./context";

export function useTma() {
  return useContext(TmaContext);
}
