import { type EnvBindings, parseEnv } from "@/config/env";
import type { UploadQueueMessage } from "@/config/types";
import { createUploadsService } from "./service";

interface QueueBatch<MessageBody> {
  messages: Array<{
    body: MessageBody;
  }>;
}

export async function processUploadQueueBatch(
  batch: QueueBatch<UploadQueueMessage>,
  rawEnv: EnvBindings,
) {
  const env = parseEnv(rawEnv);
  const service = createUploadsService(env);

  for (const message of batch.messages) {
    await service.processMessage(message.body);
  }
}
