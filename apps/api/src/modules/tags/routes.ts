import { createRouter } from "@/app/create-app";
import getTagRoute from "./routes/get-tag";
import listTagsRoute from "./routes/list-tags";

const router = createRouter().route("/", listTagsRoute).route("/", getTagRoute);

export default router;
