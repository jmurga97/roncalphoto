import type { RuntimeEnv } from "@/config/env";
import type { AcceptedImageMimeType } from "@/modules/images/types";
import { AwsClient } from "aws4fetch";

const uploadUrlTtlSeconds = 60 * 60;

function encodeKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

export async function createPresignedR2PutUrl(
  env: RuntimeEnv,
  key: string,
  contentType: AcceptedImageMimeType,
) {
  const signer = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    region: "auto",
    service: "s3",
  });
  const url = new URL(
    `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_ORIGINALS_BUCKET_NAME}/${encodeKey(key)}`,
  );

  url.searchParams.set("X-Amz-Expires", String(uploadUrlTtlSeconds));

  const signedRequest = await signer.sign(
    new Request(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
    }),
    {
      aws: {
        allHeaders: true,
        signQuery: true,
      },
    },
  );

  return {
    uploadUrl: signedRequest.url,
    expiresAt: new Date(Date.now() + uploadUrlTtlSeconds * 1000).toISOString(),
  };
}
