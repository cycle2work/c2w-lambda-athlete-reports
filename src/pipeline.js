import { each } from "bluebird";
import uniqby from "lodash.uniqby";
import moment from "moment";

import { log } from "./services/logger";
import { moveActivities, retrieveActivities, retrieveMatchingReport, upsertReport } from "./services/mongo-db";

export default async function pipeline(event, context) {
    try {
        const activities = await retrieveActivities();

        await each(activities, async activity => {
            log.debug({ activity });
            const { athlete, club, distance, id } = activity;

            const date = moment.utc(activity.start_date);
            const year = date.year();
            const month = date.format("MM");
            log.debug({ date, year, month });

            const report = await retrieveMatchingReport(activity, year, month);
            log.debug({ report });

            const updatedReport = {
                ...report,
                athlete,
                club,
                activities: uniqby(
                    [
                        ...report.activities,
                        {
                            distance,
                            id
                        }
                    ],
                    "id"
                ),
                distances: [...report.distances, distance]
            };
            log.debug({ updatedReport });

            await upsertReport(updatedReport);
        });

        await moveActivities(activities);
    } catch (error) {
        log.debug({ error });
    }

    context.succeed();
}
