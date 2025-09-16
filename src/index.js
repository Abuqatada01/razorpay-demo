// create-order.js
import Razorpay from "razorpay";
import { Client, Databases, ID } from "node-appwrite";

export default async ({ req, res, log, error }) => {
    try {
        const { amount, userId, productName } = JSON.parse(req.body);

        // Razorpay instance
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        // Create order
        const order = await razorpay.orders.create({
            amount: amount * 100, // in paise
            currency: "INR",
        });

        // Connect to Appwrite
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);

        // Save to DB
        await databases.createDocument(
            process.env.DATABASE_ID,
            process.env.COLLECTION_ID,
            order.id, // use Razorpay order_id as docId
            {
                userId,
                productName,
                amount,
                status: "unpaid",
                date: new Date(),
            }
        );

        return res.json({ success: true, order });
    } catch (err) {
        error(err.message);
        return res.json({ success: false, error: err.message }, 500);
    }
};
