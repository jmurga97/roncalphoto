import type { Hono } from "hono";
import type { EnvBindings, RuntimeEnv } from "./env";

export interface R2ObjectBody {
  body: ReadableStream<Uint8Array> | null;
  size: number;
}

export interface R2ObjectMetadata {
  size: number;
}

export interface R2PutOptions {
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
}

export interface R2BucketBinding {
  get(key: string): Promise<R2ObjectBody | null>;
  head(key: string): Promise<R2ObjectMetadata | null>;
  put(
    key: string,
    value: ArrayBuffer | ReadableStream<Uint8Array> | string,
    options?: R2PutOptions,
  ): Promise<unknown>;
}

export type ImageInfoResponse =
  | {
      format: "image/svg+xml";
    }
  | {
      format: string;
      fileSize: number;
      width: number;
      height: number;
    };

export interface ImageTransform {
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad" | "squeeze";
}

export interface ImageOutputOptions {
  format: "image/webp";
  quality?: number;
  anim?: boolean;
}

export interface ImageTransformationResult {
  response(): Response;
  contentType(): string;
  image(): ReadableStream<Uint8Array>;
}

export interface ImageTransformer {
  transform(transform: ImageTransform): ImageTransformer;
  output(options: ImageOutputOptions): Promise<ImageTransformationResult>;
}

export interface ImagesBinding {
  info(stream: ReadableStream<Uint8Array>): Promise<ImageInfoResponse>;
  input(stream: ReadableStream<Uint8Array>): ImageTransformer;
}

export interface UploadQueueMessage {
  uploadId: string;
  photoId: string;
  sessionId: string;
  originalKey: string;
  mainKey: string;
  thumbnailKey: string;
}

export interface QueueBinding<MessageBody = UploadQueueMessage> {
  send(message: MessageBody): Promise<void>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface D1DatabaseBinding {
  prepare(query: string): D1PreparedStatement;
}

export type AppBindings = {
  Bindings: EnvBindings;
  Variables: {
    runtimeEnv: RuntimeEnv;
  };
};

export type App = Hono<AppBindings>;
