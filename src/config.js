import dotenv from "dotenv";

dotenv.load();

export const LOG_LEVEL = process.env.LOG_LEVEL || "debug";
export const REPORTS_COLLECTION = process.env.REPORTS_COLLECTION || "reports";
export const ACTIVITIES_COLLECTION = process.env.ACTIVITIES_COLLECTION || "activities";
export const PROCESSED_ACTIVITIES_COLLECTION = process.env.PROCESSED_ACTIVITIES_COLLECTION || "processed-activities";
export const MONGODB_URL = process.env.NODE_ENV !== "test" ? process.env.MONGODB_URL : "mongodb://localhost:27017/test";
