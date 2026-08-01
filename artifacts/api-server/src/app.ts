import path from "node:path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

// ── Production: serve the built React frontend ──────────────────────────────
// The frontend is built into artifacts/figureheadz/dist/public by `vite build`.
// In production, Express serves those static assets and falls back to index.html
// for all non-API routes so client-side routing (Wouter) works correctly.
if (process.env.NODE_ENV === "production") {
  // __dirname is set by the esbuild banner to the directory of the compiled bundle
  // (artifacts/api-server/dist), so two levels up lands us at artifacts/.
  const frontendDir = path.resolve(__dirname, "../../figureheadz/dist/public");
  app.use(express.static(frontendDir));

  // SPA fallback — send index.html for every unmatched route so that deep
  // links like /shop, /orders, /product/:slug work after a hard refresh.
  app.use((_req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
  });
}

export default app;
