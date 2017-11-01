import chai, { expect } from "chai";
import { spy } from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import { handler } from "index";
import {
    ACTIVITIES_COLLECTION,
    PROCESSED_ACTIVITIES_COLLECTION,
    REPORTS_COLLECTION
} from "config";

import { getMongoClient } from "services/mongo-db";

describe("`Cycle2work reports function`", () => {

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

    it("[1/4]: first athlete activity, create first new report", async () => {

        await db.collection(ACTIVITIES_COLLECTION).insert({
            start_date: "2017-10-01T00:00:00Z",
            distance: 20,
            athlete: athlete1
        });

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const report = await db.collection(REPORTS_COLLECTION).findOne({ _id: "1201710" });
        expect(report).to.be.deep.equal({
            _id: "1201710",
            year: 2017,
            month: "10",
            distances: [20],
            athlete: athlete1
        });

        const processed = await db.collection(PROCESSED_ACTIVITIES_COLLECTION).find().toArray();
        expect(processed.length).to.be.equal(1);

        const activities = await db.collection(ACTIVITIES_COLLECTION).find().toArray();
        expect(activities).to.be.empty;
    });

    it("[2/4]: new athlete activity, update existing report", async () => {

        await db.collection(ACTIVITIES_COLLECTION).insert({
            start_date: "2017-10-01T00:00:00Z",
            distance: 25,
            athlete: athlete1
        });

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const report = await db.collection(REPORTS_COLLECTION).findOne({ _id: "1201710" });
        expect(report).to.be.deep.equal({
            _id: "1201710",
            year: 2017,
            month: "10",
            distances: [20, 25],
            athlete: athlete1
        });

        const processed = await db.collection(PROCESSED_ACTIVITIES_COLLECTION).find().toArray();
        expect(processed.length).to.be.equal(2);

        const activities = await db.collection(ACTIVITIES_COLLECTION).find().toArray();
        expect(activities).to.be.empty;
    });

    it("[3/4]: new athlete activity, new monthly report", async () => {

        await db.collection(ACTIVITIES_COLLECTION).insert({
            start_date: "2017-11-01T00:00:00Z",
            distance: 35,
            athlete: athlete1
        });

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const report = await db.collection(REPORTS_COLLECTION).findOne({ _id: "1201711" });
        expect(report).to.be.deep.equal({
            _id: "1201711",
            year: 2017,
            month: "11",
            distances: [35],
            athlete: athlete1
        });

        const processed = await db.collection(PROCESSED_ACTIVITIES_COLLECTION).find().toArray();
        expect(processed.length).to.be.equal(3);

        const activities = await db.collection(ACTIVITIES_COLLECTION).find().toArray();
        expect(activities).to.be.empty;
    });

    it("[4/4]: batch of new activities, create new reports and update existing", async () => {

        await db.collection(ACTIVITIES_COLLECTION).insertMany([
            {
                start_date: "2017-11-01T00:00:00Z",
                distance: 35,
                athlete: athlete1
            }, {
                start_date: "2017-11-01T00:00:00Z",
                distance: 35,
                athlete: athlete1
            }, {
                start_date: "2017-11-01T00:00:00Z",
                distance: 15,
                athlete: athlete2
            }, {
                start_date: "2017-11-01T00:00:00Z",
                distance: 15,
                athlete: athlete2
            }, {
                start_date: "2017-11-02T00:00:00Z",
                distance: 15,
                athlete: athlete2
            }, {
                start_date: "2017-08-01T00:00:00Z",
                distance: 20,
                athlete: athlete3
            }, {
                start_date: "2017-11-01T00:00:00Z",
                distance: 20,
                athlete: athlete3
            }
        ]);

        await handler(null, context);

        expect(context.succeed).to.have.been.calledOnce;

        const reports = await db.collection(REPORTS_COLLECTION).find().toArray();
        expect(reports).to.be.deep.equal([
            {
                _id: "1201710",
                year: 2017,
                month: "10",
                distances: [20, 25],
                athlete: athlete1
            }, {
                _id: "1201711",
                year: 2017,
                month: "11",
                distances: [35, 35, 35],
                athlete: athlete1
            }, {
                _id: "2201711",
                year: 2017,
                month: "11",
                distances: [15, 15, 15],
                athlete: athlete2
            }, {
                _id: "3201708",
                year: 2017,
                month: "08",
                distances: [20],
                athlete: athlete3
            }, {
                _id: "3201711",
                year: 2017,
                month: "11",
                distances: [20],
                athlete: athlete3
            }
        ]);

        const processed = await db.collection(PROCESSED_ACTIVITIES_COLLECTION).find().toArray();
        expect(processed.length).to.be.equal(10);

        const activities = await db.collection(ACTIVITIES_COLLECTION).find().toArray();
        expect(activities).to.be.empty;
    });

});
