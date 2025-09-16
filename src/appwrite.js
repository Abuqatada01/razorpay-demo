// appwrite.js
import { Client } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // your Appwrite API endpoint
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // your Project ID

export default client;
