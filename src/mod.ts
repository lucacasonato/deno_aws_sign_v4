import { sha256 } from "./deps.ts";
import { toAmz, toDateStamp } from "./date.ts";
import { getSignatureKey, signAwsV4 } from "./signing.ts";
import { Credentials, RequestHeaders } from "./types.ts";

export class AWSSignerV4 {
  private region: string;
  private credentials: Credentials;

  /**
   * @param  {string} region - the aws region
   * @param  {Credentials} credentials - the aws credentials
   */
  constructor(region?: string, credentials?: Credentials) {
    this.region = region || this.getDefaultRegion();
    this.credentials = credentials || this.getDefaultCredentials();
  }
  /**
   * @param  {string} service - the aws service,. eg: es for elastic search, dynamodb for Dynamo Db
   * @param  {string} url - request url to sign
   * @param  {string="GET"} method - request method to sign, default to GET
   * @param  {string | undefined} body - the body of PUT/POST methods, default to undefined
   * @returns {RequestHeaders} - the signed request headers
   */
  public sign = (
    service: string,
    url: string,
    method: string = "GET",
    headers: { [key: string]: string },
    body?: string,
  ): RequestHeaders => {
    const date = new Date();
    const amzdate = toAmz(date);
    const datestamp = toDateStamp(date);

    const urlObj = new URL(url);
    const { host, pathname, searchParams } = urlObj;
    const canonicalQuerystring = searchParams.toString();

    headers["x-amz-date"] = amzdate;

    let canonicalHeaders = `host:${host}`;
    let signedHeaders = "host;";
    for (const key in headers) {
      canonicalHeaders += `${key}:${headers[key]}\n`;
      signedHeaders += `${key};`;
    }

    const payload = body ?? "";
    const payloadHash = sha256(payload, "utf8", "hex") as string;

    const { awsAccessKeyId, awsSecretKey } = this.credentials;

    const canonicalRequest =
      `${method}\n${pathname}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestDigest = sha256(
      canonicalRequest,
      "utf8",
      "hex",
    ) as string;

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

    const sessionToken = Deno.env.get("AWS_SESSION_TOKEN");
    if (sessionToken) {
      headers["X-Amz-Security-Token"] = sessionToken;
    }

    return headers;
  };

  private getDefaultCredentials = () => {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = Deno.env.toObject();
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error("Invalid Credentials");
    }

    return {
      awsAccessKeyId: AWS_ACCESS_KEY_ID,
      awsSecretKey: AWS_SECRET_ACCESS_KEY,
    };
  };

  private getDefaultRegion = () => {
    const { AWS_REGION } = Deno.env.toObject();
    if (!AWS_REGION) {
      throw new Error("Invalid Region");
    }

    return AWS_REGION;
  };
}
