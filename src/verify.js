// webhook.js
import crypto from "crypto";
import { Client, Databases } from "node-appwrite";

export default async ({ req, res, log, error }) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const body = req.bodyRaw;
        const signature = req.headers["x-razorpay-signature"];

        // Verify signature
        const expected = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (signature !== expected) {
            return res.json({ success: false, message: "Invalid signature" }, 400);
        }

        const data = JSON.parse(body);

        if (data.event === "payment.captured") {
            const payment = data.payload.payment.entity;

            // Connect to Appwrite
            const client = new Client()
                .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
                .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
                .setKey(process.env.APPWRITE_API_KEY);

            const databases = new Databases(client);

            // Update DB using order_id (saved earlier)
            await databases.updateDocument(
                process.env.DATABASE_ID,
                process.env.COLLECTION_ID,
                payment.order_id,
                {
                    status: "paid",
                    paymentId: payment.id,
                }
            );
        }

        return res.json({ success: true });
    } catch (err) {
        error(err.message);
        return res.json({ success: false, error: err.message }, 500);
    }
};
