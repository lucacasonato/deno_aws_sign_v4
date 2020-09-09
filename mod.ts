import { sha256Hex } from "./deps.ts";
import { toAmz, toDateStamp } from "./src/date.ts";
import { getSignatureKey, signAwsV4 } from "./src/signing.ts";
import type { Credentials, RequestHeaders } from "./src/types.ts";
export type { Credentials, RequestHeaders };

/**
 * This class can be used to create AWS Signature V4
 * for low-level AWS REST APIs. You can either provide
 * credentials for this API using the options in the
 * constructor, or let them be aquired automatically
 * through environment variables.
 * 
 * Example usage:
 * 
 * ```ts 
 * const signer = new AWSSignerV4();
 * const url = "https://test-bucket.s3.amazonaws.com/test";
 * const method = "PUT";
 * const body = new TextEncoder().encode("Hello World!")
 * const headers = { "content-length": body.length };
 * const signedHeaders = signer.sign("s3", url, method, headers, body);
 * 
 * const response = await fetch(url, {
 *   headers: signedHeaders,
 *   method,
 *   body: payload,
 * });
 * ```
 */
export class AWSSignerV4 {
  private region: string;
  private credentials: Credentials;

  /**
   * If no region or credentials are specified, they will
   * automatically be aquired from environment variables.
   * 
   * Region is aquired from `AWS_REGION`. The credentials
   * are acquired from `AWS_ACCESS_KEY_ID`,
   * `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN`.
   */
  constructor(region?: string, credentials?: Credentials) {
    this.region = region || this.#getDefaultRegion();
    this.credentials = credentials || this.#getDefaultCredentials();
  }
  /**
   * Use this to create the signed headers required to
   * make a call to an AWS API.
   * 
   * @param service This is the AWS service, e.g. `s3` for s3, `dynamodb` for DynamoDB 
   * @param url The URL for the request to sign.
   * @param request The request method of the request to sign.
   * @param headers Other headers to include while signing.
   * @param body The body for PUT/POST methods.
   * @returns {RequestHeaders} - the signed request headers
   */
  public sign = (
    service: string,
    url: string,
    method: string = "GET",
    headers: RequestHeaders,
    body?: Uint8Array | string,
  ): RequestHeaders => {
    const date = new Date();
    const amzdate = toAmz(date);
    const datestamp = toDateStamp(date);

    const urlObj = new URL(url);
    const { host, pathname, searchParams } = urlObj;
    const canonicalQuerystring = searchParams.toString();

    headers["x-amz-date"] = amzdate;
    if (this.credentials.sessionToken) {
      headers["x-amz-security-token"] = this.credentials.sessionToken;
    }

    headers["host"] = host;

    let canonicalHeaders = "";
    let signedHeaders = "";
    for (const key of Object.keys(headers).sort()) {
      canonicalHeaders += `${key.toLowerCase()}:${headers[key]}\n`;
      signedHeaders += `${key.toLowerCase()};`;
    }
    signedHeaders = signedHeaders.substring(0, signedHeaders.length - 1);
    const payload = body ?? "";
    const payloadHash = sha256Hex(payload);

    const { awsAccessKeyId, awsSecretKey } = this.credentials;

    const canonicalRequest =
      `${method}\n${pathname}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestDigest = sha256Hex(canonicalRequest);

    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope =
      `${datestamp}/${this.region}/${service}/aws4_request`;
    const stringToSign =
      `${algorithm}\n${amzdate}\n${credentialScope}\n${canonicalRequestDigest}`;

    const signingKey = getSignatureKey(
      awsSecretKey,
      datestamp,
      this.region,
      service,
    );

    const signature = signAwsV4(signingKey, stringToSign);

    const authHeader =
      `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    headers.Authorization = authHeader;

    return headers;
  };

  #getDefaultCredentials = (): Credentials => {
    const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
    const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const AWS_SESSION_TOKEN = Deno.env.get("AWS_SESSION_TOKEN");

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error("Invalid Credentials");
    }

    return {
      awsAccessKeyId: AWS_ACCESS_KEY_ID,
      awsSecretKey: AWS_SECRET_ACCESS_KEY,
      sessionToken: AWS_SESSION_TOKEN,
    };
  };

  #getDefaultRegion = (): string => {
    const AWS_REGION = Deno.env.get("AWS_REGION");
    if (!AWS_REGION) {
      throw new Error("Invalid Region");
    }

    return AWS_REGION;
  };
}
