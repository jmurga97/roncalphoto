import { createRouter } from "@/app/create-app";

import createPhotoUploadRoute from "./routes/create-photo-upload";
import getPhotoUploadRoute from "./routes/get-photo-upload";
import retryPhotoUploadRoute from "./routes/retry-photo-upload";

const router = createRouter()
  .route("/", createPhotoUploadRoute)
  .route("/", getPhotoUploadRoute)
  .route("/", retryPhotoUploadRoute);

export default router;
