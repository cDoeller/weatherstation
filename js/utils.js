// -------------------------
// DATA FORMATTING
// -------------------------

// Format measurement values
export function formatValue(value) {
    return Number.isFinite(value) ? String(value) : "N/A";
}

// -------------------------
// DATE TIME HELPERS
// -------------------------

export function formatTimestamp(timestamp) {
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
export function formatDate(timestamp) {
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
export function formatTime(timestamp) {
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

export function getTodayDateString() {

    const date = new Date();

    return formatDateInput(date);
}


export function formatDateInput(date) {

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