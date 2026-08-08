```javascript
/* =========================================================
   MUSABX Browser Controller
   ========================================================= */

(() => {
  "use strict";

  const DDG_HOME = "https://html.duckduckgo.com/html/";

  const browserApp = document.getElementById("browserApp");
  const tabsContainer = document.getElementById("tabs");
  const frame = document.getElementById("proxyFrame");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const loader = document.getElementById("loader");

  const backButton = document.getElementById("backButton");
  const forwardButton = document.getElementById("forwardButton");
  const reloadButton = document.getElementById("reloadButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const homeButton = document.getElementById("homeButton");
  const newTabButton = document.getElementById("newTabButton");
  const escHint = document.getElementById("escHint");

  let tabs = [];
  let activeTabId = null;

  /*
    The worker is optional.

    If your Cloudflare Worker is configured as a proxy,
    put its URL here.

    If the worker is unavailable, the browser will still
    attempt to load the requested URL directly.
  */
  const WORKER_URL =
    "https://musabx-proxy.muqimh.workers.dev";

  function showLoader(show) {
    if (!loader) return;

    loader.classList.toggle("active", show);
    loader.setAttribute("aria-hidden", String(!show));
  }

  function createId() {
    return `tab-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }

  function createTab(url = DDG_HOME, title = "New Tab") {
    return {
      id: createId(),
      url,
      title
    };
  }

  function saveBrowserTabs() {
    if (window.MUSABX) {
      MUSABX.saveTabs(tabs);
      MUSABX.setActiveTab(activeTabId);
    } else {
      localStorage.setItem(
        "musabx_tabs",
        JSON.stringify(tabs)
      );

      localStorage.setItem(
        "musabx_active_tab",
        activeTabId || ""
      );
    }
  }

  function loadBrowserTabs() {
    let savedTabs = [];

    if (window.MUSABX) {
      savedTabs = MUSABX.getTabs();
    } else {
      try {
        savedTabs = JSON.parse(
          localStorage.getItem("musabx_tabs") || "[]"
        );
      } catch {
        savedTabs = [];
      }
    }

    if (!Array.isArray(savedTabs)) {
      savedTabs = [];
    }

    /*
      Always make sure there is at least one tab.
    */
    if (savedTabs.length === 0) {
      tabs = [createTab(DDG_HOME, "DuckDuckGo")];
      activeTabId = tabs[0].id;
      saveBrowserTabs();
      return;
    }

    tabs = savedTabs;

    const savedActive =
      window.MUSABX
        ? MUSABX.getActiveTab()
        : localStorage.getItem("musabx_active_tab");

    activeTabId =
      tabs.some(tab => tab.id === savedActive)
        ? savedActive
        : tabs[0].id;
  }

  function getActiveTab() {
    return tabs.find(tab => tab.id === activeTabId);
  }

  function renderTabs() {
    tabsContainer.innerHTML = "";

    tabs.forEach(tab => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        "tab" +
        (tab.id === activeTabId ? " active" : "");

      button.dataset.tabId = tab.id;

      const title = document.createElement("span");
      title.className = "tab-title";
      title.textContent =
        tab.title || getShortTitle(tab.url);

      const close = document.createElement("span");
      close.className = "tab-close";
      close.textContent = "×";
      close.setAttribute("aria-label", "Close tab");

      close.addEventListener("click", event => {
        event.stopPropagation();
        closeTab(tab.id);
      });

      button.appendChild(title);
      button.appendChild(close);

      button.addEventListener("click", () => {
        switchTab(tab.id);
      });

      tabsContainer.appendChild(button);
    });
  }

  function getShortTitle(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return "New Tab";
    }
  }

  function updateAddressBar() {
    const tab = getActiveTab();

    if (!tab) {
      searchInput.value = "";
      return;
    }

    searchInput.value = tab.url;
  }

  /*
    Build a DuckDuckGo search URL.

    Plain text:
      cats

    becomes:
      DuckDuckGo search URL.

    Website:
      example.com

    becomes:
      https://example.com
  */
  function resolveInput(value) {
    const text = String(value || "").trim();

    if (!text) {
      return DDG_HOME;
    }

    if (/^https?:\/\//i.test(text)) {
      return text;
    }

    if (
      text.includes(" ") ||
      !text.includes(".") ||
      !/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(text)
    ) {
      return `${DDG_HOME}?q=${encodeURIComponent(text)}`;
    }

    return `https://${text}`;
  }

  /*
    This is intentionally conservative.

    Only use the worker when it has been configured
    to act as an actual proxy. Otherwise direct loading
    is attempted.

    This prevents us from blindly creating malformed
    worker URLs.
  */
  function buildFrameUrl(url) {
    if (!url) {
      return DDG_HOME;
    }

    /*
      Keep DuckDuckGo direct so the homepage is reliable.
    */
    if (
      url.startsWith("https://html.duckduckgo.com/")
    ) {
      return url;
    }

    return url;
  }

  function updateTabData(url) {
    const tab = getActiveTab();

    if (!tab) return;

    tab.url = url;
    tab.title = getShortTitle(url);

    saveBrowserTabs();
    renderTabs();
    updateAddressBar();
  }

  function navigate(url, options = {}) {
    const target = resolveInput(url);

    const finalUrl = buildFrameUrl(target);

    const tab = getActiveTab();

    if (!tab) {
      const newTab = createTab(
        finalUrl,
        getShortTitle(finalUrl)
      );

      tabs.push(newTab);
      activeTabId = newTab.id;
    } else {
      tab.url = finalUrl;
      tab.title = getShortTitle(finalUrl);
    }

    saveBrowserTabs();
    renderTabs();
    updateAddressBar();

    showLoader(true);

    /*
      Changing src is enough for normal browser navigation.
    */
    frame.src = finalUrl;

    if (!options.silent) {
      searchInput.blur();
    }
  }

  function switchTab(id) {
    const tab = tabs.find(item => item.id === id);

    if (!tab) return;

    activeTabId = id;

    saveBrowserTabs();
    renderTabs();
    updateAddressBar();

    showLoader(true);

    frame.src = buildFrameUrl(tab.url);
  }

  function closeTab(id) {
    const index = tabs.findIndex(
      tab => tab.id === id
    );

    if (index === -1) return;

    tabs.splice(index, 1);

    /*
      Never allow the browser to have zero tabs.
    */
    if (tabs.length === 0) {
      const newTab = createTab(
        DDG_HOME,
        "DuckDuckGo"
      );

      tabs.push(newTab);
      activeTabId = newTab.id;
    } else if (activeTabId === id) {
      const replacementIndex = Math.max(
        0,
        index - 1
      );

      activeTabId =
        tabs[replacementIndex].id;
    }

    saveBrowserTabs();
    renderTabs();
    updateAddressBar();

    const active = getActiveTab();

    if (active) {
      showLoader(true);
      frame.src = buildFrameUrl(active.url);
    }
  }

  function newTab() {
    const tab = createTab(
      DDG_HOME,
      "DuckDuckGo"
    );

    tabs.push(tab);
    activeTabId = tab.id;

    saveBrowserTabs();
    renderTabs();
    updateAddressBar();

    showLoader(true);
    frame.src = DDG_HOME;

    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  function goHome() {
    navigate(DDG_HOME);
  }

  function reloadPage() {
    try {
      showLoader(true);
      frame.contentWindow.location.reload();
    } catch {
      frame.src = frame.src;
    }
  }

  function goBack() {
    try {
      frame.contentWindow.history.back();
    } catch {
      /*
        Cross-origin frames may block access to history.
      */
      window.history.back();
    }
  }

  function goForward() {
    try {
      frame.contentWindow.history.forward();
    } catch {
      window.history.forward();
    }
  }

  /*
    Fullscreen UI behavior.

    Browser fullscreen itself is controlled by the browser.
    Our interface responds to fullscreenchange.
  */
  async function enterFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await browserApp.requestFullscreen();
      }

      browserApp.classList.add("fullscreen-ui");
      escHint.classList.add("visible");

      setTimeout(() => {
        escHint.classList.remove("visible");
      }, 2500);
    } catch (error) {
      console.warn(
        "MUSABX could not enter fullscreen:",
        error
      );

      /*
        Fallback UI fullscreen if the browser refuses
        the native Fullscreen API.
      */
      browserApp.classList.add("fullscreen-ui");
      escHint.classList.add("visible");
    }
  }

  async function exitFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn(
        "MUSABX could not exit fullscreen:",
        error
      );
    }

    browserApp.classList.remove(
      "fullscreen-ui"
    );

    escHint.classList.remove("visible");
  }

  function handleFullscreenChange() {
    const active =
      Boolean(document.fullscreenElement);

    browserApp.classList.toggle(
      "fullscreen-ui",
      active
    );

    if (!active) {
      escHint.classList.remove("visible");
    }
  }

  /*
    Hold ESC:
    browsers normally reserve ESC for exiting native
    fullscreen. We cannot override that browser behavior.

    This listener also restores our interface whenever
    fullscreen has ended.
  */
  let escapeTimer = null;

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") {
      return;
    }

    if (escapeTimer) {
      clearTimeout(escapeTimer);
    }

    escapeTimer = setTimeout(() => {
      if (!document.fullscreenElement) {
        browserApp.classList.remove(
          "fullscreen-ui"
        );

        escHint.classList.remove(
          "visible"
        );
      }

      escapeTimer = null;
    }, 500);
  });

  /*
    Form submission.
  */
  searchForm.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const value =
        searchInput.value.trim();

      if (!value) {
        return;
      }

      navigate(value);
    }
  );

  /*
    Buttons.
  */
  backButton.addEventListener(
    "click",
    goBack
  );

  forwardButton.addEventListener(
    "click",
    goForward
  );

  reloadButton.addEventListener(
    "click",
    reloadPage
  );

  homeButton.addEventListener(
    "click",
    goHome
  );

  newTabButton.addEventListener(
    "click",
    newTab
  );

  fullscreenButton.addEventListener(
    "click",
    enterFullscreen
  );

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  /*
    When the iframe loads, remove the loading screen.

    Cross-origin pages are deliberately not inspected.
    This respects browser same-origin security.
  */
  frame.addEventListener(
    "load",
    () => {
      showLoader(false);

      const tab = getActiveTab();

      if (!tab) return;

      /*
        We don't read iframe content because it may be
        cross-origin.
      */

      renderTabs();
      updateAddressBar();
    }
  );

  frame.addEventListener(
    "error",
    () => {
      showLoader(false);
    }
  );

  /*
    If the iframe cannot display a website because the
    website blocks iframe embedding, show a useful
    message in the console rather than breaking MUSABX.
  */
  window.addEventListener(
    "message",
    event => {
      if (!event.data) return;

      if (
        event.data.type ===
        "MUSABX_OPEN_TAB"
      ) {
        if (event.data.url) {
          const tab = createTab(
            event.data.url,
            event.data.title ||
              getShortTitle(event.data.url)
          );

          tabs.push(tab);
          activeTabId = tab.id;

          saveBrowserTabs();
          renderTabs();
          updateAddressBar();

          frame.src = tab.url;
        }
      }
    }
  );

  /*
    Start browser.
  */
  loadBrowserTabs();
  renderTabs();
  updateAddressBar();

  const activeTab = getActiveTab();

  if (activeTab) {
    frame.src = buildFrameUrl(
      activeTab.url || DDG_HOME
    );
  } else {
    frame.src = DDG_HOME;
  }

  console.log(
    "MUSABX Browser loaded successfully."
  );
})();
```
