import chai, { expect } from "chai";
import { spy } from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import { handler } from "index";
import { ACTIVITIES_COLLECTION, PROCESSED_ACTIVITIES_COLLECTION, REPORTS_COLLECTION } from "config";

import { getMongoClient } from "services/mongo-db";

describe("Cycle2work reports function", () => {
    let db;
    let context;

    before(async () => {
        db = await getMongoClient();
        await db.createCollection(ACTIVITIES_COLLECTION);
        await db.createCollection(PROCESSED_ACTIVITIES_COLLECTION);
        await db.createCollection(REPORTS_COLLECTION);
    });

    after(async () => {
        await db.dropCollection(ACTIVITIES_COLLECTION);
        await db.dropCollection(PROCESSED_ACTIVITIES_COLLECTION);
        await db.dropCollection(REPORTS_COLLECTION);
        await db.close();
    });

    beforeEach(() => {
        context = {
            succeed: spy()
        };
    });

    const athlete1 = { id: 1 };
    const athlete2 = { id: 2 };
    const athlete3 = { id: 3 };

    const club = { id: 1 };

    it("[1/4]: first athlete activity, create first new report", async () => {
        await db.collection(ACTIVITIES_COLLECTION).insert({
            id: 1,
            start_date: "2017-10-01T00:00:00Z",
            distance: 20,
            athlete: athlete1,
            club
        });

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const report = await db.collection(REPORTS_COLLECTION).findOne({ _id: "11201710" });
        expect(report).to.be.deep.equal({
            _id: "11201710",
            year: 2017,
            month: "10",
            activities: [
                {
                    id: 1,
                    distance: 20
                }
            ],
            distances: [20],
            athlete: athlete1,
            club
        });

        const processed = await db
            .collection(PROCESSED_ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(processed.length).to.be.equal(1);

        const activities = await db
            .collection(ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(activities).to.be.empty;
    });

    it("[2/4]: new athlete activity, update existing report", async () => {
        await db.collection(ACTIVITIES_COLLECTION).insert({
            id: 2,
            start_date: "2017-10-01T00:00:00Z",
            distance: 25,
            athlete: athlete1,
            club
        });

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const report = await db.collection(REPORTS_COLLECTION).findOne({ _id: "11201710" });
        expect(report).to.be.deep.equal({
            _id: "11201710",
            year: 2017,
            month: "10",
            activities: [
                {
                    id: 1,
                    distance: 20
                },
                {
                    id: 2,
                    distance: 25
                }
            ],
            distances: [20, 25],
            athlete: athlete1,
            club
        });

        const processed = await db
            .collection(PROCESSED_ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(processed.length).to.be.equal(2);

        const activities = await db
            .collection(ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(activities).to.be.empty;
    });

    it("[3/4]: new athlete activity, new monthly report", async () => {
        await db.collection(ACTIVITIES_COLLECTION).insert({
            id: 3,
            start_date: "2017-11-01T00:00:00Z",
            distance: 35,
            athlete: athlete1,
            club
        });

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const report = await db.collection(REPORTS_COLLECTION).findOne({ _id: "11201711" });
        expect(report).to.be.deep.equal({
            _id: "11201711",
            year: 2017,
            month: "11",
            activities: [
                {
                    id: 3,
                    distance: 35
                }
            ],
            distances: [35],
            athlete: athlete1,
            club
        });

        const processed = await db
            .collection(PROCESSED_ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(processed.length).to.be.equal(3);

        const activities = await db
            .collection(ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(activities).to.be.empty;
    });

    it("[4/4]: batch of new activities, create new reports and update existing", async () => {
        await db.collection(ACTIVITIES_COLLECTION).insertMany([
            {
                id: 4,
                start_date: "2017-11-01T00:00:00Z",
                distance: 35,
                athlete: athlete1,
                club
            },
            {
                id: 4,
                start_date: "2017-11-01T00:00:00Z",
                distance: 35,
                athlete: athlete1,
                club
            },
            {
                id: 5,
                start_date: "2017-11-01T00:00:00Z",
                distance: 15,
                athlete: athlete2,
                club
            },
            {
                id: 5,
                start_date: "2017-11-01T00:00:00Z",
                distance: 15,
                athlete: athlete2,
                club
            },
            {
                id: 6,
                start_date: "2017-11-02T00:00:00Z",
                distance: 15,
                athlete: athlete2,
                club
            },
            {
                id: 7,
                start_date: "2017-08-01T00:00:00Z",
                distance: 20,
                athlete: athlete3,
                club
            },
            {
                id: 8,
                start_date: "2017-11-01T00:00:00Z",
                distance: 20,
                athlete: athlete3,
                club
            }
        ]);

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const reports = await db
            .collection(REPORTS_COLLECTION)
            .find()
            .toArray();
        expect(reports).to.be.deep.equal([
            {
                _id: "11201710",
                year: 2017,
                month: "10",
                activities: [
                    {
                        id: 1,
                        distance: 20
                    },
                    {
                        id: 2,
                        distance: 25
                    }
                ],
                distances: [20, 25],
                athlete: athlete1,
                club
            },
            {
                _id: "11201711",
                year: 2017,
                month: "11",
                activities: [
                    {
                        id: 3,
                        distance: 35
                    },
                    {
                        id: 4,
                        distance: 35
                    }
                ],
                distances: [35, 35, 35],
                athlete: athlete1,
                club
            },
            {
                _id: "21201711",
                year: 2017,
                month: "11",
                activities: [
                    {
                        id: 5,
                        distance: 15
                    },
                    {
                        id: 6,
                        distance: 15
                    }
                ],
                distances: [15, 15, 15],
                athlete: athlete2,
                club
            },
            {
                _id: "31201708",
                year: 2017,
                month: "08",
                activities: [
                    {
                        id: 7,
                        distance: 20
                    }
                ],
                distances: [20],
                athlete: athlete3,
                club
            },
            {
                _id: "31201711",
                year: 2017,
                month: "11",
                activities: [
                    {
                        id: 8,
                        distance: 20
                    }
                ],
                distances: [20],
                athlete: athlete3,
                club
            }
        ]);

        const processed = await db
            .collection(PROCESSED_ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(processed.length).to.be.equal(10);

        const activities = await db
            .collection(ACTIVITIES_COLLECTION)
            .find()
            .toArray();
        expect(activities).to.be.empty;
    });
});
