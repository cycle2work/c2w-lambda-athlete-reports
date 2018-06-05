import { MongoClient } from "mongodb";

import { MONGODB_URL, ACTIVITIES_COLLECTION, PROCESSED_ACTIVITIES_COLLECTION, REPORTS_COLLECTION } from "../config";

let dbInstance;

export async function getMongoClient() {
    if (!dbInstance) {
        dbInstance = await MongoClient.connect(MONGODB_URL);
    }
    return dbInstance;
}

export async function retrieveActivities(query = {}) {
    const db = await getMongoClient();
    return await db
        .collection(ACTIVITIES_COLLECTION)
        .find(query)
        .toArray();
}

export async function retrieveMatchingReport(activity, year, month) {
    const db = await getMongoClient();
    const report = await db.collection(REPORTS_COLLECTION).findOne({
        _id: `${activity.athlete.id}${activity.club.id}${year}${month}`
    });
    return (
        report || {
            _id: `${activity.athlete.id}${activity.club.id}${year}${month}`,
            year,
            month: parseInt(month),
            activities: [],
            distances: []
        }
    );
}

export async function upsertReport(report) {
    const db = await getMongoClient();
    await db.collection(REPORTS_COLLECTION).updateOne({ _id: report._id }, { $set: report }, { upsert: true });
}

export async function moveActivities(activities = []) {
    if (activities.length > 0) {
        const db = await getMongoClient();

        const ids = activities.map(x => x._id);

        await db.collection(PROCESSED_ACTIVITIES_COLLECTION).remove({
            _id: {
                $in: ids
            }
        });

        await db.collection(PROCESSED_ACTIVITIES_COLLECTION).insertMany(activities);

        await db.collection(ACTIVITIES_COLLECTION).remove({
            _id: {
                $in: ids
            }
        });
    }
}
