import { TtlCache } from "./services/cache.ts";

export async function runPlayground() {
  const cache = new TtlCache<string>();

  cache.set("test-key", "hello", 1000);

  console.log("Immediately after set:", cache.get("test-key"));

  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log("After 1200ms (should be undefined):", cache.get("test-key"));
}
