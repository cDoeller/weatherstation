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
      setActiveNavButton(navButtonNowElement);
      break;
    case "graphs":
      setActiveNavButton(navButtonGraphsElement);
      break;
    case "data-past":
      setActiveNavButton(navButtonRawElement);
      break;
    case "info":
      setActiveNavButton(navButtonInfoElement);
      break;
    case "header":
      resetButtonActive();
    default:
      setActiveNavButton(target);
  }

  window.location.href = "#" + target;

  setTimeout(() => {
    scrollActionActive = false;
  }, 800);
}

// -------------------------
// BUTTON ACTIVE CHANGE
// -------------------------

const buttonsToSwitch = [
  navButtonNowElement,
  navButtonGraphsElement,
  navButtonRawElement,
  navButtonInfoElement,
];

function resetButtonActive() {
  buttonsToSwitch.forEach((buttonElement) => {
    buttonElement.classList.remove("button-active");
  });
}

function setActiveNavButton(button) {
  resetButtonActive();
  if (buttonsToSwitch.includes(button)) button.classList.add("button-active");
}

// -------------------------
// EVENT LISTENERS
// -------------------------

// SCROLL
window.addEventListener("scroll", () => {
  // CHECK TOP BUTTON DISPLAY
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
      resetButtonActive();
    }
  }

  // CHECK ACTIVE STATE NAV BUTTONS
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
      setActiveNavButton(button);
    }
  });
});
