import { createRouter } from "@/app/create-app";
import createPhotoRoute from "./routes/create-photo";
import deletePhotoRoute from "./routes/delete-photo";
import getPhotoRoute from "./routes/get-photo";
import listPhotosRoute from "./routes/list-photos";
import updatePhotoRoute from "./routes/update-photo";

const router = createRouter()
  .route("/", listPhotosRoute)
  .route("/", createPhotoRoute)
  .route("/", getPhotoRoute)
  .route("/", updatePhotoRoute)
  .route("/", deletePhotoRoute);

export default router;
