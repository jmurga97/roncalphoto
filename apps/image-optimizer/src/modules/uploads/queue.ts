import { type EnvBindings, parseEnv } from "@/config/env";
import { createUploadsService } from "./service";
import type { ImageProcessingMessage } from "./types";

interface QueueBatch<MessageBody> {
  messages: Array<{
    body: MessageBody;
  }>;
}

export async function processUploadQueueBatch(
  batch: QueueBatch<ImageProcessingMessage>,
  rawEnv: EnvBindings,
) {
  const env = parseEnv(rawEnv);
  const service = createUploadsService(env);

  for (const message of batch.messages) {
    await service.processMessage(message.body);
  }
}
