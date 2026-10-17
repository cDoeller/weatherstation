// -------------------------
// IMPORTS
// -------------------------

import { startNavigation } from "./js/navigation.js";
import { startCharts } from "./js/charts.js";
import { updateGeneralData } from "./js/latest.js";
import { startPastData } from "./js/past.js";

// -------------------------
// MODULE EVENT LOOPS
// -------------------------

updateGeneralData();
startNavigation();
startCharts();
startPastData();