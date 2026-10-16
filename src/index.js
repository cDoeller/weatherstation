// bgas:121.92
// bhum:72.56
// bpre:1011.19
// btmp:13.91
// dhum:73.6
// dtmp:13.8
// p1:8
// p10:17
// p25:17
// pc03:576
// pc05:541
// pc10:86
// pc25:18
// pc50:0
// pc100:0
// sco2:460
// shum:62.57
// stmp:16.88

// -------------------------
// SUPABASE CONFIG
// -------------------------

SUPABASE_URL = "https://jlqdrpsaxswkzoobdtzo.supabase.co";
SUPABASE_KEY = "sb_publishable_52390tBx9m71SF57cNBF6w_mts19u5E";

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
  timeElement.innerHTML = formatTimestamp(data.date_time);

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

// -------------------------
// DATA FETCHING
// -------------------------

// FETCH LATEST
async function fetchLatestWeatherData() {
  const url =
    `${SUPABASE_URL}/rest/v1/raw_events` +
    `?select=*&device=eq.weatherstation` +
    `&order=timestamp.desc&limit=1`;

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
      console.warn("No weather data found.");
      return;
    }

    const latestData = {
      date_time: data[0].timestamp,
      data: data[0].payload ?? {},
    };

    renderLatestData(latestData);

    console.log("Latest weather data:", latestData);
  } catch (error) {
    console.error("Could not fetch latest weather data:", error);
  }
}

// FETCH HISTORY
async function fetchWeatherTableData() {
  const url =
    `${SUPABASE_URL}/rest/v1/raw_events` +
    `?select=*&device=eq.weatherstation` +
    `&order=timestamp.desc&limit=20`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      console.error("Table data error:", await response.text());
      return;
    }

    const rows = await response.json();

    renderWeatherTable(rows);

    console.log("Weather table data:", rows);
  } catch (error) {
    console.error("Could not fetch weather table data:", error);
  }
}

// -------------------------
// DATA ACTUALIZATION
// -------------------------

fetchLatestWeatherData();
fetchWeatherTableData();

// -------------------------
// GLOBAL ELEMENTS
// -------------------------

const headerElement = document.getElementById("header");
const navElement = document.getElementById("nav-buttons-wrapper");

const nowElement = document.getElementById("data-now");
const graphsElement = document.getElementById("graphs");
const pastElement = document.getElementById("data-past");
const infoElement = document.getElementById("info");

const topButtonElement = document.getElementById("top-button");
const navButtonNowElement = document.getElementById("nav-button-now");
const navButtonGraphsElement = document.getElementById("nav-button-graphs");
const navButtonRawElement = document.getElementById("nav-button-raw");
const navButtonInfoElement = document.getElementById("nav-button-info");

const navButtonElements = [
  navButtonNowElement,
  navButtonGraphsElement,
  navButtonRawElement,
  navButtonInfoElement,
];

// -------------------------
// GLOBAL VARS
// -------------------------

let scrollActionActive = false;
let topButtonActive = false;

// -------------------------
// HANDLE CLICK FUNCTIONS
// -------------------------

function handleNavButtonClick(target) {
  scrollActionActive = true;

  switch (target) {
    case "data-now":
      toggleButtonRowActiveOne(navButtonElements, navButtonNowElement);
      break;
    case "graphs":
      toggleButtonRowActiveOne(navButtonElements, navButtonGraphsElement);
      break;
    case "data-past":
      toggleButtonRowActiveOne(navButtonElements, navButtonRawElement);
      break;
    case "info":
      toggleButtonRowActiveOne(navButtonElements, navButtonInfoElement);
      break;
    case "header":
      resetButtonsActive();
      break;
    default:
  }

  window.location.href = "#" + target;

  setTimeout(() => {
    scrollActionActive = false;
  }, 800);
}

// -------------------------
// BUTTON(S) ACTIVE TOGGLE
// -------------------------

function resetButtonsActive(buttons) {
  if (!buttons) return;

  buttons.forEach((e) => {
    e.classList.remove("button-active");
  });
}

function toggleButtonRowActiveOne(buttons, button) {
  if (!buttons || !button) return

  resetButtonsActive(buttons);
  if (buttons.includes(button)) button.classList.add("button-active");
}

function toggleButtonActive(button) {
  if (!button) return;

  if (button.classList.includes("button-active")) {
    button.classList.remove("button-active")
  } else {
    button.classList.add("button-active")
  }
}

// -------------------------
// EVENT LISTENERS
// -------------------------

// SCROLL
window.addEventListener("scroll", () => {
  // CHECK TOP BUTTON DISPLAY
  checkTopButtonScrollActive();

  // CHECK ACTIVE STATE NAV BUTTONS
  checkNavButtonsScrollActive();

});

// SCROLL HELPER - TOP
function checkTopButtonScrollActive() {
  const headerBottomCoords = headerElement.getBoundingClientRect().bottom;

  if (headerBottomCoords <= 0) {
    if (!topButtonActive) {
      topButtonElement.style.display = "block";
      topButtonActive = true;
    }
  } else {
    if (topButtonActive) {
      topButtonElement.style.display = "none";
      topButtonActive = false;
      resetButtonsActive(navButtonElements);
    }
  }
}

// SCROLL HELPER - NAV
function checkNavButtonsScrollActive() {
  if (scrollActionActive) return;

  const navTop = navElement.getBoundingClientRect().top;
  const navBottom = navElement.getBoundingClientRect().bottom;

  const sections = [
    [nowElement, navButtonNowElement],
    [graphsElement, navButtonGraphsElement],
    [pastElement, navButtonRawElement],
    [infoElement, navButtonInfoElement],
  ];

  sections.forEach(([section, button]) => {
    const top = section.getBoundingClientRect().top;
    const bottom = section.getBoundingClientRect().bottom;

    if (top <= navTop && bottom > navBottom) {
      toggleButtonRowActiveOne(navButtonElements, button);
    }
  });
}