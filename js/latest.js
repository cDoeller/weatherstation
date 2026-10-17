import { fetchGeneralData } from "./data.js"
import { formatTimestamp, formatValue } from "./utils.js"

// -------------------------
// DATA FETCHING - GENERAL
// -------------------------

async function getGeneralData() {
        const generalData = await fetchGeneralData(1);

        if (!generalData) {
            return;
        }

        const latestData = {
            date_time: generalData[0].timestamp,
            data: generalData[0].payload ?? {},
        };

        renderLatestData(latestData);
    }

// -------------------------
// UPDATE INTERVAL
// -------------------------

export function updateGeneralData() {

    getGeneralData();

    setInterval(getGeneralData, 1000 * 60 * 4);
}

// -------------------------
// DATA RENDERING
// -------------------------

//  RENDER LATEST
function renderLatestData(data) {
    const values = data.data;

    const timeElement = document.getElementById("data-now-date-time");
    timeElement.textContent = formatTimestamp(data.date_time);

    document.getElementById("data-now-temperature").textContent =
        formatValue(values.dtmp) + " °C";
    document.getElementById("data-now-humidity").textContent =
        formatValue(values.dhum) + " %";
    document.getElementById("data-now-pm25").textContent =
        formatValue(values.p25) + " µg/m³";
    document.getElementById("data-now-co2").textContent =
        formatValue(values.sco2) + " ppm";
    document.getElementById("data-now-gas-resistance").textContent =
        formatValue(values.bgas) + " kΩ";
    document.getElementById("data-now-air-pressure").textContent =
        formatValue(values.bpre) + " hPa";
}