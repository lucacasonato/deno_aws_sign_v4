export interface Credentials {
  awsAccessKeyId: string;
  awsSecretKey: string;
}

export type Method = "GET" | "PUT" | "POST" | "DELETE";

export type RequestHeaders = { [header: string]: string };
