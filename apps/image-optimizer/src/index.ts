import { createApp } from "@/app/create-app";
import { processUploadQueueBatch } from "@/modules/uploads/queue";

const app = createApp();

export default {
  fetch: app.fetch,
  queue: processUploadQueueBatch,
};
