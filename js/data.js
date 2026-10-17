// -------------------------
// SUPABASE CONFIG
// -------------------------

const SUPABASE_URL = "https://jlqdrpsaxswkzoobdtzo.supabase.co";
const SUPABASE_KEY = "sb_publishable_52390tBx9m71SF57cNBF6w_mts19u5E";

// -------------------------
// DATA FETCHING - GENERAL
// -------------------------

export async function fetchGeneralData(limit = 100) {
    const url = `${SUPABASE_URL}/rest/v1/raw_events` +
        `?select=*&device=eq.weatherstation` +
        `&order=timestamp.desc&limit=${limit}`;

    try {
        const response = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            },
        });

        if (!response.ok) {
            console.error("Latest data error:", await response.text());
            return;
        }

        const data = await response.json();

        if (data.length === 0) {
            console.warn("[SUPABASE] No weather data found.");
            return;
        }

        console.log("Received Data:", data);
        return data;

    } catch (err) {
        console.log("[FETCH] Fetching Error: ", err);
    }
}

// INITIALIZE / RENDER GENERAL DATA
async function getGeneralData() {
    const generalData = await fetchGeneralData(20);

    if (!generalData) {
        return;
    }

    const latestData = {
        date_time: generalData[0].timestamp,
        data: generalData[0].payload ?? {},
    };

    renderLatestData(latestData);
    renderWeatherTable(generalData);
}

// UPDATE GENERAL DATA
export function updateGeneralData() {

    getGeneralData();

    setInterval(getGeneralData, 1000 * 60 * 4);
}

// -------------------------
// DATA FETCHING - RANGE
// -------------------------

async function fetchWeatherDataRange(startDate, endDate) { }


// -------------------------
// DATA FORMATTING
// -------------------------

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleString("de-DE", {
        timeZone: "Europe/Berlin",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

// Format date only
function formatDate(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleDateString("de-DE", {
        timeZone: "Europe/Berlin",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

// Format time only
function formatTime(timestamp) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return "N/A";
    }

    return date.toLocaleTimeString("de-DE", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

// Format measurement values
function formatValue(value) {
    return Number.isFinite(value) ? String(value) : "N/A";
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

// RENDER HISTORY

function renderWeatherTable(rows) {
    const tableBody = document.getElementById("weather-data-body");

    // Remove previous rows
    tableBody.replaceChildren();

    // Create one table row per measurement
    rows.forEach((row) => {
        const values = row.payload ?? {};

        const cells = [
            formatDate(row.timestamp),
            formatTime(row.timestamp),

            formatValue(values.dtmp),
            formatValue(values.btmp),
            formatValue(values.stmp),

            formatValue(values.dhum),
            formatValue(values.bhum),
            formatValue(values.shum),

            formatValue(values.p1),
            formatValue(values.p25),
            formatValue(values.p10),

            formatValue(values.pc03),
            formatValue(values.pc05),
            formatValue(values.pc10),
            formatValue(values.pc25),
            formatValue(values.pc50),
            formatValue(values.pc100),

            formatValue(values.sco2),
            formatValue(values.bgas),
            formatValue(values.bpre),
        ];

        const tableRow = document.createElement("tr");

        cells.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            tableRow.appendChild(cell);
        });

        tableBody.appendChild(tableRow);
    });
}

