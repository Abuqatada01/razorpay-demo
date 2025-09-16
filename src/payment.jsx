import React, { useState } from "react";
import { Functions } from "appwrite";

const Payment = ({ client }) => {
  const functions = new Functions(client);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [product, setProduct] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!amount || !product) {
      setMessage("Please enter amount and product");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // ✅ Call Appwrite Function
      const res = await functions.createExecution(
        "create-order-fn-id", // replace with your Appwrite Function ID
        JSON.stringify({
          amount: Number(amount),
          userId: "demoUser", // Replace with logged-in user ID later
          productName: product,
        })
      );

      // ✅ Parse response safely
      const data = JSON.parse(res.responseBody);
      if (!data.order) {
        throw new Error(data.message || "Order creation failed");
      }

      const { order } = data;

      // ✅ Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: order.id,
        name: "My Shop",
        description: product,
        amount: order.amount,
        handler: function (response) {
          setMessage(
            "✅ Payment Success! Payment ID: " + response.razorpay_payment_id
          );
        },
        prefill: {
          name: "Demo User",
          email: "demo@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#113E21",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setMessage("❌ Payment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Payment Page
        </h1>

        <input
          type="text"
          placeholder="Enter Product Name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />

        <input
          type="number"
          placeholder="Enter Amount (INR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Payment;
