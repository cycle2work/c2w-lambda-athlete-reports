import "babel-polyfill";

import pipeline from "./pipeline";

// pipeline definition is needed to avoid a babel-polyfill bug
export const handler = pipeline;