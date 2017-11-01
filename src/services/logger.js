import bunyan from "bunyan";

import { LOG_LEVEL } from "../config";

export const log = bunyan.createLogger({
    name: "cycle2work-reports",
    level: (process.env.NODE_ENV === "test" && !process.env.LOG_LEVEL) ? "fatal" : LOG_LEVEL
});
