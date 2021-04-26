import { createHash } from "https://deno.land/std@0.95.0/hash/mod.ts";
export function sha256Hex(data: string | Uint8Array): string {
  const hasher = createHash("sha256");
  hasher.update(data);
  return hasher.toString("hex");
}

import { HmacSha256 } from "https://deno.land/std@0.95.0/hash/sha256.ts";
import type { Message } from "https://deno.land/std@0.95.0/hash/sha256.ts";
export function hmacSha256(key: Message, data: Message): HmacSha256 {
  const hasher = new HmacSha256(key);
  hasher.update(data);
  return hasher;
}
