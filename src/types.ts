export interface Credentials {
  awsAccessKeyId: string;
  awsSecretKey: string;
  sessionToken?: string;
}

export type Method = "GET" | "PUT" | "POST" | "DELETE";

export interface RequestHeaders {
  [header: string]: string;
}
