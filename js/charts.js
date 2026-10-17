// -------------------------
// SETTINGS
// -------------------------

const MAX_CHART_POINTS = 800;
const MIN_DATE = "2026-10-14";

// -------------------------
// DATA
// -------------------------

import { fetchWeatherDataRange } from "./data.js";
import { toggleButtonActive } from "./navigation.js";

// -------------------------
// ELEMENTS
// -------------------------

const graphButtonElements = [
    document.getElementById("button-dht-tmp"),
    document.getElementById("button-dht-hum"),
    document.getElementById("button-scd-co2"),
    document.getElementById("button-bmp-gas"),
    document.getElementById("button-bmp-pre"),
    document.getElementById("button-pms-pm"),
    document.getElementById("button-pms-pmc"),
];

const startDateElement =
    document.getElementById("graphs-start-date");

const endDateElement =
    document.getElementById("graphs-end-date");

const dateSubmitElement =
    document.getElementById("graphs-date-submit");

const graphsContainerElement =
    document.getElementById("graphs-container");


// -------------------------
// CHART STATE
// -------------------------

let currentData = [];

const chartInstances = {};


// -------------------------
// CHART DEFINITIONS
// -------------------------

const chartDefinitions = {

    temperature: {
        title: "temperature",
        datasets: [
            {
                key: "dtmp",
                label: "DHT22",
            },
            {
                key: "btmp",
                label: "BME680",
            },
            {
                key: "stmp",
                label: "SCD41",
            },
        ],
    },

    humidity: {
        title: "humidity",
        datasets: [
            {
                key: "dhum",
                label: "DHT22",
            },
            {
                key: "bhum",
                label: "BME680",
            },
            {
                key: "shum",
                label: "SCD41",
            },
        ],
    },

    co2: {
        title: "co₂",
        datasets: [
            {
                key: "sco2",
                label: "CO₂",
            },
        ],
    },

    gas: {
        title: "gas resistance",
        datasets: [
            {
                key: "bgas",
                label: "BME680",
            },
        ],
    },

    pressure: {
        title: "air pressure",
        datasets: [
            {
                key: "bpre",
                label: "BME680",
            },
        ],
    },

    pm: {
        title: "pm concentration",
        datasets: [
            {
                key: "p1",
                label: "PM1",
            },
            {
                key: "p25",
                label: "PM2.5",
            },
            {
                key: "p10",
                label: "PM10",
            },
        ],
    },

    pmc: {
        title: "pm count",
        datasets: [
            {
                key: "pc03",
                label: "0.3 µm",
            },
            {
                key: "pc05",
                label: "0.5 µm",
            },
            {
                key: "pc10",
                label: "1.0 µm",
            },
            {
                key: "pc25",
                label: "2.5 µm",
            },
            {
                key: "pc50",
                label: "5.0 µm",
            },
            {
                key: "pc100",
                label: "10 µm",
            },
        ],
    },
};


// -------------------------
// BUTTON → CHART
// -------------------------

const buttonChartMap = {
    "button-dht-tmp": "temperature",
    "button-dht-hum": "humidity",
    "button-scd-co2": "co2",
    "button-bmp-gas": "gas",
    "button-bmp-pre": "pressure",
    "button-pms-pm": "pm",
    "button-pms-pmc": "pmc",
};


// -------------------------
// INITIALIZE
// -------------------------

export function startCharts() {

    setupDatePicker();

    setupGraphButtons();

    loadInitialData();
}


// -------------------------
// DATE PICKER
// -------------------------

function setupDatePicker() {

    const today = getTodayDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayString =
        formatDateInput(yesterday);

    startDateElement.min = MIN_DATE;
    startDateElement.max = today;

    endDateElement.min = MIN_DATE;
    endDateElement.max = today;

    startDateElement.value = yesterdayString;
    endDateElement.value = today;

    dateSubmitElement.addEventListener("click", () => {
        updateChartsFromDatePicker();
    });
}


// -------------------------
// INITIAL DATA
// -------------------------

async function loadInitialData() {

    const now = new Date();

    const twentyFourHoursAgo =
        new Date(now.getTime() - 24 * 60 * 60 * 1000);

    currentData =
        await fetchWeatherDataRange(
            twentyFourHoursAgo,
            now
        ) ?? [];

    renderActiveCharts();
}


// -------------------------
// DATE UPDATE
// -------------------------

async function updateChartsFromDatePicker() {

    const startDate = startDateElement.value;
    const endDate = endDateElement.value;

    if (!startDate || !endDate) {
        console.warn("[CHARTS] Please select both dates.");
        window.alert("Please select both dates.");
        return;
    }

    if (startDate < MIN_DATE) {
        console.warn("[CHARTS] Start date is too early.");
        window.alert("Please select start date later than 14. October 2026.");
        return;
    }

    if (endDate > getTodayDateString()) {
        console.warn("[CHARTS] End date cannot be in the future.");
        window.alert("End date cannot be in the future.");
        return;
    }

    if (startDate > endDate) {
        console.warn("[CHARTS] Start date must be before end date.");
        window.alert("[WARNING] Start date must be before end date.");
        return;
    }

    const start = new Date(`${startDate}T00:00:00`);

    const end = new Date(`${endDate}T00:00:00`);
    end.setDate(end.getDate() + 1);

    currentData =
        await fetchWeatherDataRange(start, end) ?? [];

    renderActiveCharts();
}


// -------------------------
// GRAPH BUTTONS
// -------------------------

function setupGraphButtons() {

    graphButtonElements.forEach((button) => {

        button.addEventListener("click", () => {

            const chartName =
                buttonChartMap[button.id];

            toggleGraph(button, chartName);
            toggleButtonActive(button);
        });
    });
}


// -------------------------
// TOGGLE GRAPH
// -------------------------

function toggleGraph(button, chartName) {

    if (!chartName) {
        return;
    }

    if (button.classList.contains("button-active")) {
        removeChart(chartName);
    } else {
        renderChart(chartName);
    }
}


// -------------------------
// RENDER ACTIVE CHARTS
// -------------------------
// ---------------------------------------------------------???

function renderActiveCharts() {

    Object.keys(chartInstances).forEach((chartName) => {
        removeChart(chartName);
    });

    graphButtonElements.forEach((button) => {

        if (!button.classList.contains("button-active")) {
            return; // beendet nur den einen durchlauf des forEach
        }

        const chartName =
            buttonChartMap[button.id];

        renderChart(chartName);
    });
}


// -------------------------
// RENDER CHART
// -------------------------

function renderChart(chartName) {

    const definition =
        chartDefinitions[chartName];

    if (!definition) {
        return;
    }

    const chartWrapper =
        document.createElement("div");

    chartWrapper.className = "graph-wrapper";

    chartWrapper.id =
        `graph-wrapper-${chartName}`;


    const chartTitle =
        document.createElement("span");

    chartTitle.textContent =
        definition.title;


    const controls =
        document.createElement("div");

    controls.className =
        "graph-controls";


    const canvasWrapper =
        document.createElement("div");

    canvasWrapper.className =
        "graph-canvas-wrapper";


    const canvas =
        document.createElement("canvas");

    canvas.id =
        `chart-${chartName}`;


    chartWrapper.appendChild(chartTitle);

    chartWrapper.appendChild(controls);

    chartWrapper.appendChild(canvasWrapper);

    canvasWrapper.appendChild(canvas);

    graphsContainerElement.appendChild(chartWrapper);


    const sampledData =
        sampleData(
            currentData,
            MAX_CHART_POINTS
        );


    const datasets = [];


    definition.datasets.forEach(
        (datasetDefinition, index) => {

            // mehr als ein sensorwert?
            if (definition.datasets.length > 1) {

                const button = createSensorButton(chartName, datasetDefinition.label, index);

                controls.appendChild(button);

                button.addEventListener(
                    "click",
                    () => {

                        toggleButtonActive(button);

                        const chart =
                            chartInstances[chartName];

                        if (!chart) {
                            return;
                        }

                        chart.data.datasets[index].hidden =
                            !button.classList.contains(
                                "button-active"
                            );

                        chart.update();
                    }
                );
            }

            datasets.push(
                createDataset(
                    sampledData,
                    datasetDefinition,
                    index
                )
            );
        }
    );

    // configure chart preferences
    chartInstances[chartName] =
        new Chart(canvas, {

            type: "line",

            data: {
                datasets: datasets,
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    mode: "index",
                    intersect: false,
                },

                plugins: {

                    legend: {
                        display: true,
                        position: 'bottom',
                        align: "start",

                        onHover: (event, legendItem, legend) => {

                            const chart = legend.chart;

                            chart.data.datasets.forEach(
                                (dataset, index) => {

                                    if (index === legendItem.datasetIndex) {

                                        dataset.borderColor = "#000000";
                                        dataset.borderWidth = 2;

                                    } else {

                                        dataset.borderColor = "#AAAAAA";
                                        dataset.borderWidth = 1;

                                    }

                                }
                            );

                            chart.update();
                        },

                        onLeave: (event, legendItem, legend) => {

                            const chart = legend.chart;

                            chart.data.datasets.forEach(
                                (dataset) => {

                                    // dataset.borderColor = "#888888";
                                    dataset.borderWidth = 1;

                                }
                            );

                            chart.update();
                        },

                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const timestamp = items[0].parsed.x;

                                return formatChartTime(timestamp);
                            },
                        },
                    },

                },

                scales: {

                    x: {

                        type: "linear",

                        ticks: {
                            maxRotation: 90,
                            minRotation: 90,

                            callback: (value) => {

                                return formatChartTime(value);

                            },

                        },

                    },

                    y: {

                        beginAtZero: false,

                    },

                },
            },
        });
}


// -------------------------
// DATASET
// -------------------------

function createDataset(
    rows,
    datasetDefinition,
    index
) {

    const grayscale = [
        "#000000",
        "#3b3b3b",
        "#6c6c6c",
        "#969696",
        "#bdbdbd",
        "#e6e6e6",
    ];

    return {

        label: datasetDefinition.label,

        data: rows
            .map((row) => {

                const value =
                    row.payload?.[datasetDefinition.key];

                if (!Number.isFinite(value)) {
                    return null;
                }

                return {
                    x: new Date(row.timestamp).getTime(),
                    y: value,
                };

            })
            .filter((value) => value !== null),

        borderColor:
            grayscale[index % grayscale.length],

        backgroundColor:
            grayscale[index % grayscale.length],

        pointRadius: 0,

        borderWidth: 1,

        tension: 0,

    };
}


// -------------------------
// SENSOR BUTTON
// -------------------------

function createSensorButton(chartName, label, index) {

    const button =
        document.createElement("button");

    button.className =
        "button button-active";

    button.textContent = label;

    button.dataset.chart = chartName;
    button.dataset.dataset = index;

    return button;
}


// -------------------------
// REMOVE CHART
// -------------------------

function removeChart(chartName) {

    const chart =
        chartInstances[chartName];

    if (chart) {
        chart.destroy();
        delete chartInstances[chartName];
    }

    const wrapper =
        document.getElementById(
            `graph-wrapper-${chartName}`
        );

    if (wrapper) {
        wrapper.remove();
    }
}


// -------------------------
// DATA SAMPLING
// -------------------------

function sampleData(data, maxPoints) {

    if (data.length <= maxPoints) {
        return data;
    }

    const step =
        Math.ceil(data.length / maxPoints);

    const sampledData =
        data.filter(
            (_, index) => index % step === 0
        );

    return sampledData;
}


// -------------------------
// DATE HELPERS
// -------------------------

function getTodayDateString() {

    const date = new Date();

    return formatDateInput(date);
}


function formatDateInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// -------------------------
// CHART TIME
// -------------------------

function formatChartTime(timestamp) {

    const date =
        new Date(timestamp);

    return date.toLocaleString(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
}