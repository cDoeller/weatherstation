// -------------------------
// GLOBAL ELEMENTS
// -------------------------

const headerElement = document.getElementById("header");
const navElement = document.getElementById("nav-buttons-wrapper");

const nowElement = document.getElementById("data-now");
const graphsElement = document.getElementById("graphs");
const pastElement = document.getElementById("data-past");
const infoElement = document.getElementById("info");
const headerTitleElement =
    document.getElementById("header-title");

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
// ELEMENT EVENTS
// -------------------------

navButtonElements.forEach((button) => {

    button.addEventListener("click", () => {

        let target;

        switch (button) {
            case navButtonNowElement:
                target = nowElement.id;
                break;

            case navButtonGraphsElement:
                target = graphsElement.id;
                break;

            case navButtonRawElement:
                target = pastElement.id;
                break;

            case navButtonInfoElement:
                target = infoElement.id;
                break;
        }

        handleNavButtonClick(target);
    });
});

topButtonElement.addEventListener("click", () => {
    handleNavButtonClick(nowElement.id)
});

// -------------------------
// HANDLE CLICK FUNCTIONS
// -------------------------

function handleNavButtonClick(target) {
    scrollActionActive = true;

    switch (target) {
        case nowElement.id:
            toggleButtonRowActiveOne(navButtonElements, navButtonNowElement);
            break;
        case graphsElement.id:
            toggleButtonRowActiveOne(navButtonElements, navButtonGraphsElement);
            break;
        case pastElement.id:
            toggleButtonRowActiveOne(navButtonElements, navButtonRawElement);
            break;
        case infoElement.id:
            toggleButtonRowActiveOne(navButtonElements, navButtonInfoElement);
            break;
        case nowElement.id:
            resetButtonsActive();
            break;
    }

    window.location.href = "#" + target;

    setTimeout(() => {
        scrollActionActive = false;
    }, 1000);
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

export function toggleButtonActive(button) {
    if (!button) return;

    if (button.classList.contains("button-active")) {
        button.classList.remove("button-active")
    } else {
        button.classList.add("button-active")
    }
}

// -------------------------
// EVENT LISTENERS
// -------------------------

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

// SCROLL HELPER - HEADER TITLE
function checkHeaderTitleScroll() {

    if (window.scrollY > 10) {

        headerTitleElement.classList.add(
            "header-title-inverted"
        );

    } else {

        headerTitleElement.classList.remove(
            "header-title-inverted"
        );
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

// -------------------------
// NAVIGATION LOOP
// -------------------------

export function startNavigation() {

    // EVENT LISTENER - SCROLL
    window.addEventListener("scroll", () => {
        // CHECK TOP BUTTON DISPLAY
        checkTopButtonScrollActive();

        // CHECK HEADER TITLE
        checkHeaderTitleScroll();

        // CHECK ACTIVE STATE NAV BUTTONS
        checkNavButtonsScrollActive();
    });
}