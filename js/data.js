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

        // console.log("Received Data:", data);

        return data;

    } catch (err) {
        console.log("[FETCH] Fetching Error: ", err);
    }
}

// -------------------------
// DATA FETCHING - RANGE
// -------------------------

export async function fetchWeatherDataRange(startDate, endDate) {
    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const allData = [];
    const pageSize = 1000;

    let offset = 0;

    try {

        while (true) {

            const url =
                `${SUPABASE_URL}/rest/v1/raw_events` +
                `?select=timestamp,payload` +
                `&device=eq.weatherstation` +
                `&timestamp=gte.${start}` +
                `&timestamp=lt.${end}` +
                `&order=timestamp.asc` +
                `&limit=${pageSize}` +
                `&offset=${offset}`;

            const response = await fetch(url, {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                },
            });

            if (!response.ok) {
                console.error(
                    "[SUPABASE] Range data error:",
                    await response.text()
                );

                return;
            }

            const data = await response.json();

            allData.push(...data);

            if (data.length < pageSize) {
                break;
            }

            offset += pageSize;
        }

        console.log(
            `[SUPABASE] Range data received: ${allData.length}`
        );

        return allData;

    } catch (err) {
        console.error("[FETCH] Range fetching error:", err);
    }
}

// -------------------------
// DATA FETCHING - PAST DATA
// -------------------------

export async function fetchPastDataPage(
    startDate,
    endDate,
    page = 1,
    pageSize = 20
) {

    const start = startDate.toISOString();
    const end = endDate.toISOString();

    const offset = (page - 1) * pageSize;

    const url =
        `${SUPABASE_URL}/rest/v1/raw_events` +
        `?select=timestamp,payload` +
        `&device=eq.weatherstation` +
        `&timestamp=gte.${start}` +
        `&timestamp=lt.${end}` +
        `&order=timestamp.desc` +
        `&limit=${pageSize}` +
        `&offset=${offset}`;

    try {

        const response = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                Prefer: "count=exact",
            },
        });

        if (!response.ok) {
            console.error(
                "[SUPABASE] Past data error:",
                await response.text()
            );

            return;
        }

        const data = await response.json();

        const contentRange =
            response.headers.get("Content-Range");

        let totalRows = 0;

        if (contentRange) {
            const total = contentRange.split("/")[1];
            totalRows = Number(total);
        }

        return {
            rows: data,
            totalRows: totalRows,
        };

    } catch (err) {

        console.error(
            "[FETCH] Past data fetching error:",
            err
        );
    }
}