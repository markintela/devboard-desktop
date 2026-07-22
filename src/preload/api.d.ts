import type { DevboardApi } from "./index";

declare global {
  interface Window {
    devboard: DevboardApi;
  }
}
