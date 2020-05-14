# deno-aws-signer-v4 [![Build Status](https://travis-ci.org/silver-xu/deno-aws-sign-v4.svg?branch=master)](https://travis-ci.org/silver-xu/deno-aws-sign-v4)

> Generates AWS Signature V4 for AWS low-level REST APIs.

## Installation

```javascript
import { AWSSignerV4 } from "https://raw.githubusercontent.com/silver-xu/deno-aws-sign-v4/master/src/mod.ts";
```

## Region & Credentials

The below example will generate signed headers based on the region and credentials in following ENV variables:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

```javascript
const signer = new AWSSignerV4();
const headers = signer.sign("es", endpoint, "POST", payload);

const response = await fetch(endpoint, {
  headers
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

const headers = signer.sign("es", endpoint, "POST", payload);

const response = await fetch(endpoint, {
  headers
  method,
  body: payload,
});

```
