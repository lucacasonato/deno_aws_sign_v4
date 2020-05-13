const method = "POST";
import { sha256 } from "./deps.ts";
import { toAmz, toDateStamp } from "./date.ts";
import { getSignatureKey, signAwsV4 } from "./signing.ts";
import { Credentials } from "./types.ts";

const endpoint =
  "https://search-jurassi-elasti-637ekxnqkku7-ck3h4rezux6u2m6gfwfrb2ipfm.ap-southeast-2.es.amazonaws.com/repo_index/repo/_search";

const payload = {
  query: {
    multi_match: {
      query: "comprihensiv guide",
      fields: ["title", "summary"],
      fuzziness: "AUTO",
    },
  },
  _source: ["title", "summary", "publish_date"],
  size: 1,
};

export class AWSSignerV4 {
  private region: string;
  private credentials: Credentials;

  constructor(region?: string, credentials?: Credentials) {
    this.region = region || this.getDefaultRegion();
    this.credentials = credentials || this.getDefaultCredentials();
  }

  public sign = (
    service: string,
    url: string,
    method: string = "GET",
    body: any = undefined
  ) => {
    const date = new Date();
    const amzdate = toAmz(date);
    const datestamp = toDateStamp(date);

    const urlObj = new URL(url);
    const { host, pathname, searchParams } = urlObj;
    const canonicalQuerystring = searchParams.toString();

    const canonicalHeaders = `host:${host}\nx-amz-date:${amzdate}\n`;
    const signedHeaders = "host;x-amz-date";

    const payload = body ? JSON.stringify(body) : "";
    const payloadHash = sha256(payload, "utf8", "hex") as string;

    const { awsAccessKeyId, awsSecretKey } = this.credentials;

    const canonicalRequest = `${method}\n${pathname}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestDigest = sha256(
      canonicalRequest,
      "utf8",
      "hex"
    ) as string;

    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${datestamp}/${this.region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzdate}\n${credentialScope}\n${canonicalRequestDigest}`;

    const signingKey = getSignatureKey(
      awsSecretKey,
      datestamp,
      this.region,
      service
    );

    const signature = signAwsV4(signingKey, stringToSign);

    const authHeader = `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const headers = {
      "x-amz-date": amzdate,
      Authorization: authHeader,
    };

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
