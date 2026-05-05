import { createRouter } from "@/app/create-app";
import sendOtpRoute from "./routes/send-otp";

const router = createRouter().route("/", sendOtpRoute);

export default router;
