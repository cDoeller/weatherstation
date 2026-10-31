// -------------------------
// IMPORTS
// -------------------------

import { startNavigation } from "./js/navigation.js";
import { startCharts } from "./js/charts.js";
import { updateGeneralData } from "./js/latest.js";
import { startPastData } from "./js/past.js";
import { WindFlag } from "./js/windFlag.js";

const windFlagCanvas =
    document.querySelector("#wind-flag");

const windFlag =
    new WindFlag({
        canvas: windFlagCanvas,
        size: 20,
        lineWidth: 1.5
    });

// -------------------------
// MODULE EVENT LOOPS
// -------------------------

updateGeneralData();
startNavigation();
startCharts();
startPastData();
windFlag.start();