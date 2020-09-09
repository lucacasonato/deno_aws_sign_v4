import { AWSSignerV4 } from "./mod.ts";
import {
  assertEquals,
  assert,
  assertStringContains,
} from "https://deno.land/std@0.68.0/testing/asserts.ts";

Deno.test("construct from env vars", () => {
  Deno.env.set("AWS_ACCESS_KEY_ID", "examplekey");
  Deno.env.set("AWS_SECRET_ACCESS_KEY", "secretkey");
  Deno.env.set("AWS_SESSION_TOKEN", "sessiontoken");
  Deno.env.set("AWS_REGION", "us-east-1");

  const signer = new AWSSignerV4();
  const headers = signer.sign(
    "dynamodb",
    "https://test.dynamodb.us-east-1.amazonaws.com",
    "GET",
    { "x-hello": "world" },
    "A dynamodb request!",
  );
  const now = new Date();
  const today = `${now.getFullYear()}${
    (now.getMonth() + 1).toString().padStart(2, "0")
  }${now.getDate().toString().padStart(2, "0")}`;
  assertStringContains(headers["x-amz-date"], `${today}T`);
  assertEquals(headers["x-amz-security-token"], "sessiontoken");
  assertEquals(headers["x-hello"], "world");
  assertEquals(headers["host"], "test.dynamodb.us-east-1.amazonaws.com");
  assertStringContains(
    headers["Authorization"],
    `AWS4-HMAC-SHA256 Credential=examplekey/${today}/us-east-1/dynamodb/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token;x-hello, Signature=`,
  );
});

Deno.test("construct manually", () => {
  const signer = new AWSSignerV4("us-east-2", {
    awsAccessKeyId: "example_key",
    awsSecretKey: "secret_key",
    sessionToken: "session_token",
  });
  const headers = signer.sign(
    "dynamodb",
    "https://test.dynamodb.us-east-1.amazonaws.com",
    "GET",
    { "x-hello": "world" },
    "A dynamodb request!",
  );
  const now = new Date();
  const today = `${now.getFullYear()}${
    (now.getMonth() + 1).toString().padStart(2, "0")
  }${now.getDate().toString().padStart(2, "0")}`;
  assertStringContains(headers["x-amz-date"], `${today}T`);
  assertEquals(headers["x-amz-security-token"], "session_token");
  assertEquals(headers["x-hello"], "world");
  assertStringContains(
    headers["Authorization"],
    `AWS4-HMAC-SHA256 Credential=example_key/${today}/us-east-2/dynamodb/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token;x-hello, Signature=`,
  );
});
