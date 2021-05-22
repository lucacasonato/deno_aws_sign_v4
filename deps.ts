import { HmacSha256, Sha256 } from "https://deno.land/std@0.95.0/hash/sha256.ts";
import type { Message } from "https://deno.land/std@0.95.0/hash/sha256.ts";

export function sha256(data: Message): Sha256 {
  const hasher = new Sha256();
  return hasher.update(data);
}

export function hmacSha256(key: Message, data: Message): HmacSha256 {
  const hasher = new HmacSha256(key);
  return hasher.update(data);
}
