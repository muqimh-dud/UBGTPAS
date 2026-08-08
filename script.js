/* =========================================================
MUSABX — GLOBAL SCRIPT
script.js
========================================================= */

"use strict";

/* =========================================================
MUSABX GLOBAL CONFIG
========================================================= */

const MUSABX = {
name: "MUSABX",
version: "2.0.0",
storagePrefix: "musabx_",

pages: {
home: "index.html",
browser: "browser.html",
games: "games.html",
library: "library.html",
achievements: "achievements.html",
settings: "settings.html"
},

storage: {
theme: "musabx_theme",
accent: "musabx_accent",
animations: "musabx_animations",
compact: "musabx_compact",
fullscreen: "musabx_fullscreen",
searchEngine: "musabx_search_engine",
searchHistory: "musabx_search_history",
favorites: "musabx_favorites",
recentPages: "musabx_recent_pages"
}
};

/* =========================================================
DOM HELPERS
========================================================= */

function $(selector, parent = document) {
return parent.querySelector(selector);
}

function $$(selector, parent = document) {
return Array.from(parent.querySelectorAll(selector));
}

function getElement(id) {
return document.getElementById(id);
}

function exists(element) {
return element !== null && element !== undefined;
}

/* =========================================================
STORAGE HELPERS
========================================================= */

function saveData(key, value) {
try {
localStorage.setItem(
key,
JSON.stringify(value)
);
return true;
} catch (error) {
console.warn(
"MUSABX could not save data:",
error
);
return false;
}
}

function loadData(key, fallback = null) {
try {
const value = localStorage.getItem(key);

```
if (value === null) {
  return fallback;
}

return JSON.parse(value);
```

} catch (error) {
console.warn(
"MUSABX could not load data:",
error
);

```
return fallback;
```

}
}

function removeData(key) {
try {
localStorage.removeItem(key);
} catch (error) {
console.warn(
"MUSABX could not remove data:",
error
);
}
}

/* =========================================================
PAGE DETECTION
========================================================= */

function getCurrentPage() {
const file = (
window.location.pathname
.split("/")
.pop()
.toLowerCase()
);

if (!file || file === "/") {
return "home";
}

if (file === "index.html") {
return "home";
}

if (file === "browser.html") {
return "browser";
}

if (file === "games.html") {
return "games";
}

if (file === "library.html") {
return "library";
}

if (
file === "achievements.html" ||
file === "achievement.html"
) {
return "achievements";
}

if (file === "settings.html") {
return "settings";
}

return "home";
}

/* =========================================================
ACTIVE NAVIGATION
========================================================= */

function setupActiveNavigation() {
const currentPage = getCurrentPage();

const navLinks = $$(
".nav a, .sidebar a, [data-page]"
);

navLinks.forEach((link) => {
const href = (
link.getAttribute("href") || ""
).toLowerCase();

```
const dataPage = (
  link.dataset.page || ""
).toLowerCase();

const target = dataPage || href;

link.classList.remove("active");

if (
  target.includes(
    MUSABX.pages[currentPage]
  )
) {
  link.classList.add("active");
}

if (
  currentPage === "home" &&
  (
    target === "index.html" ||
    target === "" ||
    target === "/"
  )
) {
  link.classList.add("active");
}
```

});
}

/* =========================================================
MOBILE SIDEBAR
========================================================= */

function setupMobileSidebar() {
const sidebar = $(
".sidebar"
);

const menuButton = $(
".mobile-menu"
);

if (!exists(sidebar) || !exists(menuButton)) {
return;
}

menuButton.addEventListener(
"click",
() => {
sidebar.classList.toggle(
"open"
);

```
  menuButton.setAttribute(
    "aria-expanded",
    String(
      sidebar.classList.contains("open")
    )
  );
}
```

);

document.addEventListener(
"click",
(event) => {
if (
window.innerWidth > 800
) {
return;
}

```
  const clickedInsideSidebar =
    sidebar.contains(event.target);

  const clickedMenu =
    menuButton.contains(event.target);

  if (
    !clickedInsideSidebar &&
    !clickedMenu
  ) {
    sidebar.classList.remove(
      "open"
    );
  }
}
```

);

$$(".sidebar a").forEach(
(link) => {
link.addEventListener(
"click",
() => {
sidebar.classList.remove(
"open"
);
}
);
}
);
}

/* =========================================================
FULLSCREEN
========================================================= */

function isFullscreen() {
return Boolean(
document.fullscreenElement ||
document.webkitFullscreenElement
);
}

async function enterFullscreen() {
try {
if (
document.documentElement.requestFullscreen
) {
await document.documentElement.requestFullscreen();
return true;
}

```
if (
  document.documentElement.webkitRequestFullscreen
) {
  document.documentElement.webkitRequestFullscreen();
  return true;
}
```

} catch (error) {
console.warn(
"Fullscreen could not be enabled:",
error
);
}

return false;
}

async function exitFullscreen() {
try {
if (
document.exitFullscreen
) {
await document.exitFullscreen();
return true;
}

```
if (
  document.webkitExitFullscreen
) {
  document.webkitExitFullscreen();
  return true;
}
```

} catch (error) {
console.warn(
"Fullscreen could not be disabled:",
error
);
}

return false;
}

async function toggleFullscreen() {
if (isFullscreen()) {
await exitFullscreen();
} else {
await enterFullscreen();
}

updateFullscreenButton();
}

function updateFullscreenButton() {
const button =
getElement("fullscreenButton") ||
getElement("fullscreenBtn");

if (!exists(button)) {
return;
}

const active = isFullscreen();

button.textContent =
active ? "⛶" : "⛶";

button.title =
active
? "Exit fullscreen"
: "Fullscreen";

button.setAttribute(
"aria-label",
active
? "Exit fullscreen"
: "Fullscreen"
);
}

function setupFullscreen() {
const button =
getElement("fullscreenButton") ||
getElement("fullscreenBtn");

if (!exists(button)) {
return;
}

button.addEventListener(
"click",
toggleFullscreen
);

document.addEventListener(
"fullscreenchange",
updateFullscreenButton
);

document.addEventListener(
"webkitfullscreenchange",
updateFullscreenButton
);

updateFullscreenButton();
}

/* =========================================================
SEARCH ENGINE
========================================================= */

const SEARCH_ENGINES = {
duckduckgo:
"https://duckduckgo.com/?q=",

google:
"https://www.google.com/search?q=",

bing:
"https://www.bing.com/search?q=",

brave:
"https://search.brave.com/search?q="
};

function getSearchEngine() {
return loadData(
MUSABX.storage.searchEngine,
"duckduckgo"
);
}

function setSearchEngine(engine) {
if (
!Object.prototype.hasOwnProperty.call(
SEARCH_ENGINES,
engine
)
) {
engine = "duckduckgo";
}

saveData(
MUSABX.storage.searchEngine,
engine
);
}

function looksLikeUrl(value) {
const text = value.trim();

if (!text) {
return false;
}

if (
/^https?:///i.test(text)
) {
return true;
}

if (
/^[www./i.test(text)](http://www./i.test%28text%29)
) {
return true;
}

if (
/^[a-z0-9-]+.[a-z]{2,}(/.*)?$/i.test(
text
)
) {
return true;
}

return false;
}

function normalizeUrl(value) {
const text = value.trim();

if (
/^https?:///i.test(text)
) {
return text;
}

if (
/^[www./i.test(text)](http://www./i.test%28text%29)
) {
return `https://${text}`;
}

if (
/^[a-z0-9-]+.[a-z]{2,}(/.*)?$/i.test(
text
)
) {
return `https://${text}`;
}

return null;
}

function buildSearchUrl(query) {
const engine =
getSearchEngine();

const base =
SEARCH_ENGINES[
engine
] ||
SEARCH_ENGINES.duckduckgo;

return (
base +
encodeURIComponent(query)
);
}

function searchMUSABX(query) {
const value =
String(query || "").trim();

if (!value) {
return;
}

addSearchHistory(value);

const directUrl =
normalizeUrl(value);

if (directUrl) {
window.location.href =
directUrl;
return;
}

window.location.href =
buildSearchUrl(value);
}

/* =========================================================
GLOBAL SEARCH FORM
========================================================= */

function setupGlobalSearch() {
const forms = $$(
"#searchForm, .search-form"
);

forms.forEach(
(form) => {
form.addEventListener(
"submit",
(event) => {
event.preventDefault();

```
      const input =
        $("input", form);

      if (!exists(input)) {
        return;
      }

      searchMUSABX(
        input.value
      );
    }
  );
}
```

);
}

/* =========================================================
SEARCH HISTORY
========================================================= */

function getSearchHistory() {
return loadData(
MUSABX.storage.searchHistory,
[]
);
}

function addSearchHistory(query) {
const value =
String(query || "").trim();

if (!value) {
return;
}

let history =
getSearchHistory();

history = history.filter(
(item) =>
item.toLowerCase() !==
value.toLowerCase()
);

history.unshift(value);

history =
history.slice(0, 25);

saveData(
MUSABX.storage.searchHistory,
history
);
}

function clearSearchHistory() {
saveData(
MUSABX.storage.searchHistory,
[]
);

renderSearchHistory();
}

function renderSearchHistory() {
const container =
$("#searchHistory");

if (!exists(container)) {
return;
}

const history =
getSearchHistory();

if (!history.length) {
container.innerHTML = `       <div class="history-empty">         <div>🕘</div>         <h3>No search history</h3>         <p>Your recent searches will appear here.</p>       </div>
    `;

```
return;
```

}

container.innerHTML =
history
.map(
(item, index) => ` <div class="history-item"> <div class="history-icon">
🔎 </div>

```
        <div class="history-text">
          <strong>${escapeHtml(item)}</strong>
          <span>Recent search</span>
        </div>

        <button
          class="history-search"
          type="button"
          data-history-index="${index}"
          title="Search again"
        >
          ↗
        </button>
      </div>
    `
  )
  .join("");
```

$$(".history-search", container)
.forEach(
(button) => {
button.addEventListener(
"click",
() => {
const index =
Number(
button.dataset.historyIndex
);

```
        const value =
          history[index];

        if (value) {
          searchMUSABX(value);
        }
      }
    );
  }
);
```

}

/* =========================================================
SEARCH ENGINE SELECTORS
========================================================= */

function setupSearchEngineButtons() {
const buttons = $$(
".search-engine, [data-search-engine]"
);

const current =
getSearchEngine();

buttons.forEach(
(button) => {
const engine =
button.dataset.searchEngine;

```
  if (
    engine === current
  ) {
    button.classList.add(
      "active"
    );
  }

  button.addEventListener(
    "click",
    () => {
      const selected =
        button.dataset.searchEngine;

      if (!selected) {
        return;
      }

      setSearchEngine(
        selected
      );

      buttons.forEach(
        (item) => {
          item.classList.remove(
            "active"
          );
        }
      );

      button.classList.add(
        "active"
      );
    }
  );
}
```

);
}

/* =========================================================
THEME SYSTEM
========================================================= */

function getTheme() {
return loadData(
MUSABX.storage.theme,
"dark"
);
}

function applyTheme(theme) {
const body =
document.body;

if (!body) {
return;
}

body.classList.remove(
"light-mode"
);

if (theme === "light") {
body.classList.add(
"light-mode"
);
}

if (theme === "system") {
const prefersLight =
window.matchMedia &&
window.matchMedia(
"(prefers-color-scheme: light)"
).matches;

```
if (prefersLight) {
  body.classList.add(
    "light-mode"
  );
}
```

}

saveData(
MUSABX.storage.theme,
theme
);
}

function setupTheme() {
const theme =
getTheme();

applyTheme(theme);

const selects = $$(
'[data-setting="theme"], #themeSelect'
);

selects.forEach(
(select) => {
select.value =
theme;

```
  select.addEventListener(
    "change",
    () => {
      applyTheme(
        select.value
      );
    }
  );
}
```

);

if (
window.matchMedia
) {
const media =
window.matchMedia(
"(prefers-color-scheme: light)"
);

```
media.addEventListener(
  "change",
  () => {
    if (
      getTheme() ===
      "system"
    ) {
      applyTheme(
        "system"
      );
    }
  }
);
```

}
}

/* =========================================================
ACCENT COLOR
========================================================= */

const ACCENTS = {
purple: "#7474ff",
blue: "#5c9dff",
cyan: "#5bd8ff",
green: "#5ee6a6",
pink: "#ee73c4",
orange: "#ffad63",
red: "#ff7272"
};

function applyAccent(accent) {
const value =
ACCENTS[accent] ||
ACCENTS.purple;

document.documentElement
.style
.setProperty(
"--musabx-accent",
value
);

saveData(
MUSABX.storage.accent,
accent
);
}

function setupAccent() {
const saved =
loadData(
MUSABX.storage.accent,
"purple"
);

applyAccent(saved);

$$(
"[data-accent]"
).forEach(
(button) => {
const accent =
button.dataset.accent;

```
  if (
    accent === saved
  ) {
    button.classList.add(
      "active"
    );
  }

  button.addEventListener(
    "click",
    () => {
      applyAccent(
        accent
      );

      $$(
        "[data-accent]"
      ).forEach(
        (item) => {
          item.classList.remove(
            "active"
          );
        }
      );

      button.classList.add(
        "active"
      );
    }
  );
}
```

);
}

/* =========================================================
ANIMATION SETTINGS
========================================================= */

function setupAnimations() {
const enabled =
loadData(
MUSABX.storage.animations,
true
);

if (!enabled) {
document.body.classList.add(
"no-animations"
);
}

$$(
'[data-setting="animations"] input'
).forEach(
(input) => {
input.checked =
enabled;

```
  input.addEventListener(
    "change",
    () => {
      const value =
        input.checked;

      saveData(
        MUSABX.storage.animations,
        value
      );

      document.body.classList.toggle(
        "no-animations",
        !value
      );
    }
  );
}
```

);
}

/* =========================================================
COMPACT MODE
========================================================= */

function setupCompactMode() {
const enabled =
loadData(
MUSABX.storage.compact,
false
);

if (enabled) {
document.body.classList.add(
"compact-mode"
);
}

$$(
'[data-setting="compact"] input'
).forEach(
(input) => {
input.checked =
enabled;

```
  input.addEventListener(
    "change",
    () => {
      const value =
        input.checked;

      saveData(
        MUSABX.storage.compact,
        value
      );

      document.body.classList.toggle(
        "compact-mode",
        value
      );
    }
  );
}
```

);
}

/* =========================================================
FAVORITES
========================================================= */

function getFavorites() {
return loadData(
MUSABX.storage.favorites,
[]
);
}

function isFavorite(id) {
return getFavorites()
.includes(id);
}

function toggleFavorite(id) {
if (!id) {
return false;
}

let favorites =
getFavorites();

const index =
favorites.indexOf(id);

if (index === -1) {
favorites.push(id);
} else {
favorites.splice(
index,
1
);
}

saveData(
MUSABX.storage.favorites,
favorites
);

updateFavoriteButtons();

return index === -1;
}

function updateFavoriteButtons() {
$$(
"[data-favorite]"
).forEach(
(button) => {
const id =
button.dataset.favorite;

```
  const active =
    isFavorite(id);

  button.classList.toggle(
    "favorited",
    active
  );

  button.setAttribute(
    "aria-pressed",
    String(active)
  );

  button.textContent =
    active
      ? "★"
      : "☆";
}
```

);
}

function setupFavorites() {
$$(
"[data-favorite]"
).forEach(
(button) => {
button.addEventListener(
"click",
(event) => {
event.preventDefault();
event.stopPropagation();

```
      toggleFavorite(
        button.dataset.favorite
      );
    }
  );
}
```

);

updateFavoriteButtons();
}

/* =========================================================
RECENT PAGES
========================================================= */

function getRecentPages() {
return loadData(
MUSABX.storage.recentPages,
[]
);
}

function addRecentPage(
page = getCurrentPage()
) {
const pages =
getRecentPages();

const filtered =
pages.filter(
(item) =>
item !== page
);

filtered.unshift(page);

saveData(
MUSABX.storage.recentPages,
filtered.slice(0, 10)
);
}

/* =========================================================
PAGE TRANSITIONS
========================================================= */

function setupPageTransitions() {
$$(
"a[href]"
).forEach(
(link) => {
link.addEventListener(
"click",
(event) => {
const href =
link.getAttribute(
"href"
);

```
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      if (
        link.target ===
        "_blank"
      ) {
        return;
      }

      document.body.classList.add(
        "page-leaving"
      );
    }
  );
}
```

);
}

/* =========================================================
KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts() {
document.addEventListener(
"keydown",
(event) => {
const target =
event.target;

```
  const isTyping =
    target &&
    (
      target.tagName ===
      "INPUT" ||
      target.tagName ===
      "TEXTAREA" ||
      target.tagName ===
      "SELECT" ||
      target.isContentEditable
    );

  /*
   * Ctrl + K
   * Focus search
   */

  if (
    event.ctrlKey &&
    event.key.toLowerCase() ===
    "k"
  ) {
    event.preventDefault();

    const search =
      $(
        "#searchInput"
      ) ||
      $(
        ".search-form input"
      ) ||
      $(
        ".game-search input"
      ) ||
      $(
        ".library-search input"
      ) ||
      $(
        ".browser-address input"
      );

    if (exists(search)) {
      search.focus();
      search.select();
    }
  }

  /*
   * Escape
   */

  if (
    event.key ===
    "Escape"
  ) {
    const sidebar =
      $(".sidebar");

    if (exists(sidebar)) {
      sidebar.classList.remove(
        "open"
      );
    }
  }

  /*
   * F11
   */

  if (
    event.key ===
    "F11"
  ) {
    event.preventDefault();

    toggleFullscreen();
  }

  /*
   * Don't run page
   * shortcuts while typing.
   */

  if (isTyping) {
    return;
  }

  /*
   * G + H
   * Home
   */

  if (
    event.key.toLowerCase() ===
    "h"
  ) {
    if (
      event.altKey
    ) {
      window.location.href =
        MUSABX.pages.home;
    }
  }

}
```

);
}

/* =========================================================
SETTINGS RESET
========================================================= */

function resetMUSABXSettings() {
const keys = [
MUSABX.storage.theme,
MUSABX.storage.accent,
MUSABX.storage.animations,
MUSABX.storage.compact,
MUSABX.storage.searchEngine
];

keys.forEach(
removeData
);

applyTheme("dark");
applyAccent("purple");

document.body.classList.remove(
"no-animations",
"compact-mode"
);

location.reload();
}

/* =========================================================
CLEAR ALL MUSABX DATA
========================================================= */

function clearAllMUSABXData() {
const confirmed =
window.confirm(
"This will delete your MUSABX settings, favorites, search history, and saved data. Continue?"
);

if (!confirmed) {
return;
}

Object.keys(
localStorage
)
.filter(
(key) =>
key.startsWith(
MUSABX.storagePrefix
)
)
.forEach(
(key) => {
localStorage.removeItem(
key
);
}
);

location.reload();
}

/* =========================================================
CONNECT SETTINGS BUTTONS
========================================================= */

function setupDataControls() {
const resetButtons = $$(
"[data-reset-settings]"
);

resetButtons.forEach(
(button) => {
button.addEventListener(
"click",
resetMUSABXSettings
);
}
);

const clearButtons = $$(
"[data-clear-data]"
);

clearButtons.forEach(
(button) => {
button.addEventListener(
"click",
clearAllMUSABXData
);
}
);

const clearHistoryButtons =
$$(
"[data-clear-history]"
);

clearHistoryButtons.forEach(
(button) => {
button.addEventListener(
"click",
clearSearchHistory
);
}
);
}

/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHtml(value) {
return String(value)
.replaceAll(
"&",
"&"
)
.replaceAll(
"<",
"<"
)
.replaceAll(
">",
">"
)
.replaceAll(
'"',
"""
)
.replaceAll(
"'",
"'"
);
}

/* =========================================================
TOAST NOTIFICATIONS
========================================================= */

function createToastContainer() {
let container =
$("#musabxToastContainer");

if (exists(container)) {
return container;
}

container =
document.createElement(
"div"
);

container.id =
"musabxToastContainer";

container.style.position =
"fixed";

container.style.right =
"20px";

container.style.bottom =
"20px";

container.style.zIndex =
"9999";

container.style.display =
"flex";

container.style.flexDirection =
"column";

container.style.gap =
"8px";

document.body.appendChild(
container
);

return container;
}

function showToast(
message,
type = "normal"
) {
const container =
createToastContainer();

const toast =
document.createElement(
"div"
);

toast.style.minWidth =
"220px";

toast.style.maxWidth =
"340px";

toast.style.padding =
"13px 15px";

toast.style.border =
"1px solid rgba(255,255,255,0.08)";

toast.style.borderRadius =
"12px";

toast.style.background =
"rgba(16,18,36,0.96)";

toast.style.color =
"#e8e9f3";

toast.style.fontSize =
"11px";

toast.style.boxShadow =
"0 20px 50px rgba(0,0,0,0.3)";

toast.style.backdropFilter =
"blur(18px)";

if (
type === "success"
) {
toast.style.borderColor =
"rgba(98,230,166,0.2)";
}

if (
type === "error"
) {
toast.style.borderColor =
"rgba(255,100,100,0.2)";
}

toast.textContent =
message;

container.appendChild(
toast
);

setTimeout(
() => {
toast.style.opacity =
"0";

```
  toast.style.transform =
    "translateY(8px)";

  toast.style.transition =
    "0.25s ease";

  setTimeout(
    () => {
      toast.remove();
    },
    250
  );
},
2600
```

);
}

/* =========================================================
ONLINE STATUS
========================================================= */

function setupOnlineStatus() {
const indicators = $$(
"[data-online-status]"
);

function update() {
const online =
navigator.onLine;

```
indicators.forEach(
  (indicator) => {
    indicator.textContent =
      online
        ? "Online"
        : "Offline";

    indicator.classList.toggle(
      "offline",
      !online
    );
  }
);
```

}

window.addEventListener(
"online",
update
);

window.addEventListener(
"offline",
update
);

update();
}

/* =========================================================
CLOCK
========================================================= */

function setupClock() {
const clocks =
$$(
"[data-clock]"
);

if (!clocks.length) {
return;
}

function updateClock() {
const now =
new Date();

```
clocks.forEach(
  (clock) => {
    const format =
      clock.dataset.clock ||
      "time";

    if (
      format ===
      "date"
    ) {
      clock.textContent =
        now.toLocaleDateString();
    } else {
      clock.textContent =
        now.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        );
    }
  }
);
```

}

updateClock();

setInterval(
updateClock,
1000
);
}

/* =========================================================
COPY BUTTONS
========================================================= */

function setupCopyButtons() {
$$(
"[data-copy]"
).forEach(
(button) => {
button.addEventListener(
"click",
async () => {
const value =
button.dataset.copy;

```
      if (!value) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          value
        );

        showToast(
          "Copied to clipboard.",
          "success"
        );
      } catch (error) {
        showToast(
          "Could not copy.",
          "error"
        );
      }
    }
  );
}
```

);
}

/* =========================================================
EXTERNAL LINKS
========================================================= */

function setupExternalLinks() {
$$(
'a[href^="http"]'
).forEach(
(link) => {
if (
!link.hasAttribute(
"target"
)
) {
link.target =
"_blank";
}

```
  link.rel =
    "noopener noreferrer";
}
```

);
}

/* =========================================================
SCROLL REVEAL
========================================================= */

function setupScrollReveal() {
const elements =
$$(
"[data-reveal]"
);

if (
!elements.length ||
!("IntersectionObserver" in window)
) {
return;
}

const observer =
new IntersectionObserver(
(entries) => {
entries.forEach(
(entry) => {
if (
entry.isIntersecting
) {
entry.target.classList.add(
"revealed"
);

```
          observer.unobserve(
            entry.target
          );
        }
      }
    );
  },
  {
    threshold: 0.12
  }
);
```

elements.forEach(
(element) => {
observer.observe(
element
);
}
);
}

/* =========================================================
PAGE TITLE
========================================================= */

function setupPageTitle() {
const titles = {
home: "MUSABX",
browser: "Browser • MUSABX",
games: "Games • MUSABX",
library: "Library • MUSABX",
achievements:
"Achievements • MUSABX",
settings:
"Settings • MUSABX"
};

const page =
getCurrentPage();

if (
titles[page]
) {
document.title =
titles[page];
}
}

/* =========================================================
NAVIGATION HELPERS
========================================================= */

function goToPage(page) {
if (
MUSABX.pages[page]
) {
window.location.href =
MUSABX.pages[page];
}
}

window.MUSABXNavigate =
goToPage;

/* =========================================================
GLOBAL API
========================================================= */

window.MUSABX = {
...MUSABX,

$,
$$,

getCurrentPage,

saveData,
loadData,
removeData,

searchMUSABX,
buildSearchUrl,
addSearchHistory,
clearSearchHistory,

getFavorites,
isFavorite,
toggleFavorite,

getTheme,
applyTheme,
applyAccent,

showToast,

resetMUSABXSettings,
clearAllMUSABXData,

enterFullscreen,
exitFullscreen,
toggleFullscreen,

goToPage
};

/* =========================================================
INITIALIZATION
========================================================= */

function initializeMUSABX() {

/*

* Core page setup
  */

setupPageTitle();

setupActiveNavigation();

setupMobileSidebar();

setupFullscreen();

/*

* Search
  */

setupGlobalSearch();

setupSearchEngineButtons();

renderSearchHistory();

/*

* Preferences
  */

setupTheme();

setupAccent();

setupAnimations();

setupCompactMode();

/*

* User data
  */

setupFavorites();

addRecentPage();

/*

* Utilities
  */

setupDataControls();

setupKeyboardShortcuts();

setupPageTransitions();

setupOnlineStatus();

setupClock();

setupCopyButtons();

setupExternalLinks();

setupScrollReveal();

/*

* Console branding
  */

console.log(
`%c${MUSABX.name} %cv${MUSABX.version}`,
"font-size:18px;font-weight:900;color:#7777ff",
"font-size:11px;color:#888"
);

console.log(
"MUSABX global system initialized."
);
}

/* =========================================================
START
========================================================= */

if (
document.readyState ===
"loading"
) {
document.addEventListener(
"DOMContentLoaded",
initializeMUSABX
);
} else {
initializeMUSABX();
}
