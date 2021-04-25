import { AWSSignerV4 } from "./mod.ts";
import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";

Deno.test("construct from env vars", async () => {
  Deno.env.set("AWS_ACCESS_KEY_ID", "examplekey");
  Deno.env.set("AWS_SECRET_ACCESS_KEY", "secretkey");
  Deno.env.set("AWS_SESSION_TOKEN", "sessiontoken");
  Deno.env.set("AWS_REGION", "us-east-1");

  const signer = new AWSSignerV4();
  const req = await signer.sign(
    "dynamodb",
    new Request("https://test.dynamodb.us-east-1.amazonaws.com", {
      method: "POST",
      headers: { "x-hello": "world" },
      body: "A dynamodb request!",
    }),
  );
  const now = new Date();
  const today = `${now.getFullYear()}${
    (now.getMonth() + 1)
      .toString()
      .padStart(2, "0")
  }${now.getDate().toString().padStart(2, "0")}`;
  assertEquals(req.method, "POST");
  assertEquals(await req.text(), "A dynamodb request!");
  assertStringIncludes(req.headers.get("x-amz-date")!, `${today}T`);
  assertEquals(req.headers.get("x-amz-security-token"), "sessiontoken");
  assertEquals(req.headers.get("x-hello"), "world");
  assertEquals(
    req.headers.get("host"),
    "test.dynamodb.us-east-1.amazonaws.com",
  );
  assertStringIncludes(
    req.headers.get("Authorization")!,
    `AWS4-HMAC-SHA256 Credential=examplekey/${today}/us-east-1/dynamodb/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token;x-hello, Signature=`,
  );
});

Deno.test("construct manually", async () => {
  const signer = new AWSSignerV4("us-east-2", {
    awsAccessKeyId: "example_key",
    awsSecretKey: "secret_key",
    sessionToken: "session_token",
  });
  const req = await signer.sign(
    "dynamodb",
    new Request("https://test.dynamodb.us-east-1.amazonaws.com", {
      method: "POST",
      headers: { "x-hello": "world" },
      body: "A dynamodb request!",
    }),
  );
  const now = new Date();
  const today = `${now.getFullYear()}${
    (now.getMonth() + 1)
      .toString()
      .padStart(2, "0")
  }${now.getDate().toString().padStart(2, "0")}`;
  assertEquals(req.method, "POST");
  assertEquals(await req.text(), "A dynamodb request!");
  assertStringIncludes(req.headers.get("x-amz-date")!, `${today}T`);
  assertEquals(req.headers.get("x-amz-security-token"), "session_token");
  assertEquals(req.headers.get("x-hello"), "world");
  assertEquals(
    req.headers.get("host"),
    "test.dynamodb.us-east-1.amazonaws.com",
  );
  assertStringIncludes(
    req.headers.get("Authorization")!,
    `AWS4-HMAC-SHA256 Credential=example_key/${today}/us-east-2/dynamodb/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token;x-hello, Signature=`,
  );
});

Deno.test("example", async () => {
  const signer = new AWSSignerV4();
  const body = new TextEncoder().encode("Hello World!");
  const request = new Request("https://test-bucket.s3.amazonaws.com/test", {
    method: "PUT",
    headers: { "content-length": body.length.toString() },
    body,
  });
  const _req = await signer.sign("s3", request);
});
