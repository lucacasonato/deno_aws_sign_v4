import { hmac, encode } from "./deps.ts";
const AWS4: Uint8Array = encode("AWS4", "utf8");

export const signAwsV4 = (
  key: string | Uint8Array,
  msg: string
): string | Uint8Array => {
  return hmac("sha256", key, msg, undefined, "hex");
};

export const getSignatureKey = (
  key: string | Uint8Array,
  dateStamp: string,
  region: string,
  service: string
) => {
  if (typeof key === "string") {
    key = encode(key, "utf8") as Uint8Array;
  }

  const paddedKey: Uint8Array = new Uint8Array(4 + key.byteLength);

  paddedKey.set(AWS4, 0);
  paddedKey.set(key, 4);

  let mac: Uint8Array = hmac(
    "sha256",
    paddedKey,
    dateStamp as string,
    "utf8"
  ) as Uint8Array;

  mac = hmac("sha256", mac, region, "utf8") as Uint8Array;
  mac = hmac("sha256", mac, service, "utf8") as Uint8Array;
  mac = hmac("sha256", mac, "aws4_request", "utf8") as Uint8Array;

  return mac;
};
