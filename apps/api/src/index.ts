import "dotenv/config";
import { createApp } from "./createApp.js";

const port = Number(process.env.PORT ?? 4000);
const app = await createApp();
await app.listen({ port, host: "0.0.0.0" });
app.log.info(`API listening on http://localhost:${port}`);
