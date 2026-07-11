import { Router, type IRouter } from "express";
import { SendContactMessageBody } from "@workspace/api-zod";
import { sendContactMessageEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const body = SendContactMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    await sendContactMessageEmail(body.data);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Contact message delivery failed");
    res.status(502).json({ error: "Failed to send message" });
  }
});

export default router;
