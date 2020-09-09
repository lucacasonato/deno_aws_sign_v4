# deno-aws-signer-v4

![ci](https://github.com/denoland/deno/workflows/ci/badge.svg)
[![deno doc](https://doc.deno.land/badge.svg)](https://raw.githubusercontent.com/silver-xu/deno-aws-sign-v4/master/src/mod.ts)

> Generates AWS Signature V4 for AWS low-level REST APIs.

## Installation

```ts
import { AWSSignerV4 } from "https://raw.githubusercontent.com/silver-xu/deno-aws-sign-v4/master/src/mod.ts";
```

## Region & Credentials

The below example will generate signed headers based on the region and credentials in following ENV variables:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_SESSION_TOKEN
- AWS_REGION

```javascript
const signer = new AWSSignerV4();
const signedHeaders = signer.sign("es", endpoint, "POST", headers, payload);

const response = await fetch(endpoint, {
  headers: signedHeaders,
  method,
  body: payload,
});
```

## Complete setup

```javascript
const signer = new AWSSignerV4(
  'ap-southeast-2',  // Your real region
  {
    awsAccessKeyId: 1234 // Your real access key id
    awsSecretKey: 1234 // Your real secret key
  });

const signedHeaders = signer.sign("es", endpoint, "POST", headers, payload);

const response = await fetch(endpoint, {
  headers: signedHeaders,
  method,
  body: payload,
});

```

---

The module is licenced under GPL-3.0. For more see the LICENCE file.

This module is forked from @silver-xu's work in [https://github.com/silver-xu/deno-aws-sign-v4]. Many thanks to them. This fork has some large feature improvements and bug fixes, and has tests.
