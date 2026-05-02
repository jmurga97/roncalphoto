import type { ImagesBinding } from "@/config/types";
import type { ImageInfo, ImageProfile, TransformedImage } from "./types";
import { WEBP_MIME_TYPE } from "./types";

export interface ImageOptimizationEngine {
  readInfo(stream: ReadableStream<Uint8Array>, fallbackSize?: number): Promise<ImageInfo>;
  transform(stream: ReadableStream<Uint8Array>, profile: ImageProfile): Promise<TransformedImage>;
}

export class CloudflareImagesEngine implements ImageOptimizationEngine {
  constructor(private readonly images: ImagesBinding) {}

  async readInfo(stream: ReadableStream<Uint8Array>, fallbackSize = 0): Promise<ImageInfo> {
    const info = await this.images.info(stream);

    if (!("fileSize" in info)) {
      return {
        format: info.format,
        fileSize: fallbackSize,
        width: 0,
        height: 0,
      };
    }

    return info;
  }

  async transform(
    stream: ReadableStream<Uint8Array>,
    profile: ImageProfile,
  ): Promise<TransformedImage> {
    const result = await this.images
      .input(stream)
      .transform({
        width: profile.width,
        fit: profile.fit,
      })
      .output({
        format: WEBP_MIME_TYPE,
        quality: profile.quality,
        anim: false,
      });

    const response = result.response();
    const arrayBuffer = await response.arrayBuffer();

    return {
      bytes: arrayBuffer,
      contentType: response.headers.get("Content-Type") ?? result.contentType() ?? WEBP_MIME_TYPE,
    };
  }
}
