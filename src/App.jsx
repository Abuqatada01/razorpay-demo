// App.jsx
import React from "react";
import Payment from "./Payment.jsx";
import client from "./appwrite.js";

function App() {
  return <Payment client={client} />;
}

export default App;
