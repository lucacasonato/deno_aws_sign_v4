// per https://docs.aws.amazon.com/general/latest/gr/create-signed-request.html#create-canonical-request

const encoder = new TextEncoder();

export function encodeUriS3(input: string, isQueryParam = false): string {
  let result = "";
  for (const ch of input) {
    if (
      (ch >= "A" && ch <= "Z") ||
      (ch >= "a" && ch <= "z") ||
      (ch >= "0" && ch <= "9") ||
      ch == "_" ||
      ch == "-" ||
      ch == "~" ||
      ch == "."
    ) {
      result += ch;
	} else if (!isQueryParam && ch == "/") {
      result += "/";
    } else {
      result += stringToHex(ch);
    }
  }
  return result;
}

function stringToHex(input: string) {
  return [...encoder.encode(input)]
    .map((s) => "%" + s.toString(16).padStart(2, '0'))
    .join("")
    .toUpperCase();
}

export function toCanonicalQueryString(search: URLSearchParams | string) {
  const queryParams = new URLSearchParams(search);
  queryParams.sort();

  return [...queryParams.entries()].map(([k, v]) =>
    [encodeUriS3(k, true), encodeUriS3(v, true)].join("=")
  ).join("&");
}
