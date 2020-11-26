# deno_aws_sign_v4

![ci](https://github.com/lucacasonato/deno_aws_sign_v4/workflows/ci/badge.svg)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/aws_sign_v4@0.1.5/mod.ts)

Generates AWS Signature V4 for AWS low-level REST APIs.

## Example

The below example will generate signed headers based on the region and credentials in following ENV variables:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_SESSION_TOKEN
- AWS_REGION

```typescript
import { AWSSignerV4 } from "https://deno.land/x/aws_sign_v4@0.1.5/mod.ts";

const signer = new AWSSignerV4();
const body = new TextEncoder().encode("Hello World!");
const request = new Request("https://test-bucket.s3.amazonaws.com/test", {
  method: "PUT",
  headers: { "content-length": body.length.toString() },
  body,
});
const req = await signer.sign("s3", request);

const response = await fetch(req);
```

You can also explicitly specify credentials and a region when constructing a new `AWSSignerV4`:

```typescript
const signer = new AWSSignerV4("us-east-1", {
  awsAccessKeyId: "accesskey";
  awsSecretKey: "secretkey";
  sessionToken: "sessiontoken";
});
```

## Related projects

- [deno_s3](https://deno.land/x/s3)
- [deno_sqs](https://deno.land/x/sqs)

---

The module is licenced under GPL-3.0. For more see the LICENCE file.

This module is forked from @silver-xu's work in [https://github.com/silver-xu/deno-aws-sign-v4]. Many thanks to them. This fork has some large feature improvements and bug fixes, and has tests.
