import { createRouter } from "@/app/create-app";
import createSessionRoute from "./routes/create-session";
import deleteSessionRoute from "./routes/delete-session";
import getSessionRoute from "./routes/get-session";
import listSessionsRoute from "./routes/list-sessions";
import updateSessionRoute from "./routes/update-session";

const router = createRouter()
  .route("/", listSessionsRoute)
  .route("/", createSessionRoute)
  .route("/", getSessionRoute)
  .route("/", updateSessionRoute)
  .route("/", deleteSessionRoute);

export default router;
