export { hmac } from "https://denopkg.com/chiefbiiko/hmac@v1.0.2/mod.ts";

import { createHash } from "https://deno.land/std@0.71.0/hash/mod.ts";
export function sha256Hex(data: string | Uint8Array): string {
  const hasher = createHash("sha256");
  hasher.update(data);
  return hasher.toString("hex");
}
