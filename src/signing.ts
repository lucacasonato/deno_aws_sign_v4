import { hmacSha256 } from "../deps.ts";
const encoder = new TextEncoder();
const AWS4: Uint8Array = encoder.encode("AWS4");

/**
 * @param  {string|Uint8Array} key - the key to sign aws v4 signature
 * @param  {string} msg - the message to sign
 * @returns {string|Uint8Array} - signature
 */
export const signAwsV4 = (
  key: string | Uint8Array,
  msg: string,
): string | Uint8Array => {
  return hmacSha256(key, msg).hex();
};

/**
 * @param  {string|Uint8Array} key - the key to generate signature key
 * @param  {string} dateStamp - dateStamp in ISO format
 * @param  {string} region - aws region
 * @param  {string} service - aws service
 * @returns {string|Uint8Array} - generated key
 */
export const getSignatureKey = (
  key: string | Uint8Array,
  dateStamp: string,
  region: string,
  service: string,
): string | Uint8Array => {
  if (typeof key === "string") {
    key = encoder.encode(key);
  }

  const paddedKey: Uint8Array = new Uint8Array(4 + key.byteLength);

  paddedKey.set(AWS4, 0);
  paddedKey.set(key, 4);

  let mac = hmacSha256(
    paddedKey,
    dateStamp,
  ).arrayBuffer();

  mac = hmacSha256(mac, region).arrayBuffer();
  mac = hmacSha256(mac, service).arrayBuffer();
  mac = hmacSha256(mac, "aws4_request").arrayBuffer();

  return new Uint8Array(mac);
};
