// -------------------------
// IMPORTS
// -------------------------

import {
    fetchPastDataPage,
    fetchWeatherDataRange
} from "./data.js";

import {
    formatDate,
    formatTime,
    formatValue
} from "./utils.js";


// -------------------------
// SETTINGS
// -------------------------

const PAGE_SIZE = 20;
const MIN_DATE = "2026-10-14";


// -------------------------
// ELEMENTS
// -------------------------

const startDateElement =
    document.getElementById(
        "data-past-start-date"
    );

const endDateElement =
    document.getElementById(
        "data-past-end-date"
    );

const dateSubmitElement =
    document.getElementById(
        "data-past-date-submit"
    );

const tableBodyElement =
    document.getElementById(
        "weather-data-body"
    );

const paginationElement =
    document.getElementById(
        "data-past-pagination"
    );

const csvButtonElement =
    document.getElementById(
        "data-past-csv"
    );


// -------------------------
// STATE
// -------------------------

let currentPage = 1;
let totalRows = 0;

let currentStartDate = null;
let currentEndDate = null;


// -------------------------
// INITIALIZE
// -------------------------

export function startPastData() {

    setupDatePicker();
    setupDateSubmit();
    setupCSVButton();

    loadInitialData();
}


// -------------------------
// DATE PICKER
// -------------------------

function setupDatePicker() {

    const today =
        getTodayDateString();

    const yesterday =
        new Date();

    yesterday.setDate(
        yesterday.getDate() 
    );

    const yesterdayString =
        formatDateInput(yesterday);


    startDateElement.min = MIN_DATE;
    startDateElement.max = today;

    endDateElement.min = MIN_DATE;
    endDateElement.max = today;


    startDateElement.value =
        yesterdayString;

    endDateElement.value =
        today;
}


// -------------------------
// INITIAL DATA
// -------------------------

function loadInitialData() {

    updatePastData();
}


// -------------------------
// DATE SUBMIT
// -------------------------

function setupDateSubmit() {

    dateSubmitElement.addEventListener(
        "click",
        () => {

            currentPage = 1;

            updatePastData();

        }
    );
}


// -------------------------
// UPDATE PAST DATA
// -------------------------

async function updatePastData() {

    const startDateValue =
        startDateElement.value;

    const endDateValue =
        endDateElement.value;


    if (!startDateValue || !endDateValue) {

        console.warn(
            "[PAST] Please select both dates."
        );

        return;
    }


    if (startDateValue < MIN_DATE) {

        console.warn(
            "[PAST] Start date is too early."
        );

        return;
    }


    if (
        endDateValue >
        getTodayDateString()
    ) {

        console.warn(
            "[PAST] End date cannot be in the future."
        );

        return;
    }


    if (startDateValue > endDateValue) {

        console.warn(
            "[PAST] Start date must be before end date."
        );

        window.alert(
            "[WARNING] Start date must be before end date."
        );

        return;
    }


    const startDate =
        new Date(
            `${startDateValue}T00:00:00`
        );


    const endDate =
        new Date(
            `${endDateValue}T00:00:00`
        );

    endDate.setDate(
        endDate.getDate() + 1
    );


    currentStartDate = startDate;
    currentEndDate = endDate;


    const result =
        await fetchPastDataPage(
            startDate,
            endDate,
            currentPage,
            PAGE_SIZE
        );


    if (!result) {
        return;
    }


    totalRows =
        result.totalRows;


    renderWeatherTable(
        result.rows
    );

    renderPagination();
}


// -------------------------
// RENDER TABLE
// -------------------------

function renderWeatherTable(rows) {

    tableBodyElement.replaceChildren();


    rows.forEach((row) => {

        const values =
            row.payload ?? {};


        const cells = [

            formatDate(
                row.timestamp
            ),

            formatTime(
                row.timestamp
            ),


            formatValue(
                values.dtmp
            ),

            formatValue(
                values.btmp
            ),

            formatValue(
                values.stmp
            ),


            formatValue(
                values.dhum
            ),

            formatValue(
                values.bhum
            ),

            formatValue(
                values.shum
            ),


            formatValue(
                values.p1
            ),

            formatValue(
                values.p25
            ),

            formatValue(
                values.p10
            ),


            formatValue(
                values.pc03
            ),

            formatValue(
                values.pc05
            ),

            formatValue(
                values.pc10
            ),

            formatValue(
                values.pc25
            ),

            formatValue(
                values.pc50
            ),

            formatValue(
                values.pc100
            ),


            formatValue(
                values.sco2
            ),

            formatValue(
                values.bgas
            ),

            formatValue(
                values.bpre
            ),

        ];


        const tableRow =
            document.createElement("tr");


        cells.forEach((value) => {

            const cell =
                document.createElement("td");

            cell.textContent = value;

            tableRow.appendChild(
                cell
            );

        });


        tableBodyElement.appendChild(
            tableRow
        );

    });
}


// -------------------------
// PAGINATION
// -------------------------

function renderPagination() {

    paginationElement.replaceChildren();


    const totalPages =
        Math.ceil(
            totalRows / PAGE_SIZE
        );


    if (totalPages <= 1) {
        return;
    }


    // PREVIOUS

    const previousButton =
        document.createElement("button");

    previousButton.className =
        "past-data-pagination-element";

    previousButton.textContent =
        "<";

    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        () => {

            currentPage--;

            updatePastData();

        }
    );


    paginationElement.appendChild(
        previousButton
    );


    // PAGE BUTTONS

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");

        pageButton.className =
            "past-data-pagination-element";

        pageButton.textContent = page < 10 ? "0" + page : page;


        if (page === currentPage) {

            pageButton.classList.add(
                "past-data-pagination-element-active"
            );

        }


        pageButton.addEventListener(
            "click",
            () => {

                currentPage = page;

                updatePastData();

            }
        );


        paginationElement.appendChild(
            pageButton
        );

    }


    // NEXT

    const nextButton =
        document.createElement("button");

    nextButton.className =
        "past-data-pagination-element";

    nextButton.textContent =
        ">";

    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        () => {

            currentPage++;

            updatePastData();

        }
    );


    paginationElement.appendChild(
        nextButton
    );
}


// -------------------------
// CSV
// -------------------------

function setupCSVButton() {

    csvButtonElement.addEventListener(
        "click",
        downloadCSV
    );
}


async function downloadCSV() {

    if (
        !currentStartDate ||
        !currentEndDate
    ) {

        console.warn(
            "[CSV] No date range selected."
        );

        return;
    }


    const rows =
        await fetchWeatherDataRange(
            currentStartDate,
            currentEndDate
        );


    if (!rows || rows.length === 0) {

        console.warn(
            "[CSV] No data available."
        );

        return;
    }


    const header = [

        "date",
        "time",

        "dht_tmp",
        "bme_tmp",
        "scd_tmp",

        "dht_hum",
        "bme_hum",
        "scd_hum",

        "pm1",
        "pm2.5",
        "pm10",

        "pc0.3",
        "pc0.5",
        "pc1.0",
        "pc2.5",
        "pc5.0",
        "pc10",

        "co2",
        "gas",
        "pressure",

    ];


    const csvRows = [
        header.join(",")
    ];


    rows.forEach((row) => {

        const values =
            row.payload ?? {};


        const cells = [

            formatDate(
                row.timestamp
            ),

            formatTime(
                row.timestamp
            ),


            values.dtmp,
            values.btmp,
            values.stmp,

            values.dhum,
            values.bhum,
            values.shum,

            values.p1,
            values.p25,
            values.p10,

            values.pc03,
            values.pc05,
            values.pc10,
            values.pc25,
            values.pc50,
            values.pc100,

            values.sco2,
            values.bgas,
            values.bpre,

        ];


        const csvLine =
            cells
                .map(value => {

                    if (
                        value === null ||
                        value === undefined
                    ) {
                        return "";
                    }

                    return String(value);

                })
                .join(",");


        csvRows.push(csvLine);

    });


    const csv =
        csvRows.join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "weather-data.csv";


    link.click();


    URL.revokeObjectURL(url);
}


// -------------------------
// DATE HELPERS
// -------------------------

function getTodayDateString() {

    const date =
        new Date();

    return formatDateInput(
        date
    );
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