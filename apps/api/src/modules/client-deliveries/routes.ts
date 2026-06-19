import { createRouter } from "@/app/create-app";

import getClientDeliveryRoute from "./routes/get-client-delivery";

const router = createRouter().route("/", getClientDeliveryRoute);

export default router;
