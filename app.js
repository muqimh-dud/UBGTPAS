```javascript
/* =========================================================
   MUSABX — Shared Application Controller
   ========================================================= */

(() => {
  "use strict";

  const STORAGE = {
    tabs: "musabx_tabs",
    activeTab: "musabx_active_tab",
    favorites: "musabx_favorites",
    recentGames: "musabx_recent_games",
    achievements: "musabx_achievements",
    settings: "musabx_settings"
  };

  const DEFAULTS = {
    homepage: "https://html.duckduckgo.com/html/",
    theme: "default"
  };

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("MUSABX storage error:", error);
    }
  }

  function getSettings() {
    return {
      ...DEFAULTS,
      ...readStorage(STORAGE.settings, {})
    };
  }

  function saveSettings(settings) {
    writeStorage(STORAGE.settings, {
      ...getSettings(),
      ...settings
    });
  }

  function getFavorites() {
    return readStorage(STORAGE.favorites, []);
  }

  function isFavorite(gameId) {
    return getFavorites().includes(gameId);
  }

  function toggleFavorite(gameId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(gameId);

    if (index === -1) {
      favorites.push(gameId);
    } else {
      favorites.splice(index, 1);
    }

    writeStorage(STORAGE.favorites, favorites);

    window.dispatchEvent(
      new CustomEvent("musabx:favoritesChanged", {
        detail: {
          gameId,
          favorite: index === -1
        }
      })
    );

    return index === -1;
  }

  function getRecentGames() {
    return readStorage(STORAGE.recentGames, []);
  }

  function recordGamePlayed(gameId) {
    let recent = getRecentGames();

    recent = recent.filter(id => id !== gameId);
    recent.unshift(gameId);

    // Keep the library small and fast.
    recent = recent.slice(0, 20);

    writeStorage(STORAGE.recentGames, recent);

    window.dispatchEvent(
      new CustomEvent("musabx:gamePlayed", {
        detail: { gameId }
      })
    );
  }

  function getAchievements() {
    return readStorage(STORAGE.achievements, {});
  }

  function unlockAchievement(id) {
    const achievements = getAchievements();

    if (achievements[id]) {
      return false;
    }

    achievements[id] = {
      unlocked: true,
      date: new Date().toISOString()
    };

    writeStorage(STORAGE.achievements, achievements);

    window.dispatchEvent(
      new CustomEvent("musabx:achievementUnlocked", {
        detail: { id }
      })
    );

    return true;
  }

  function getTabs() {
    return readStorage(STORAGE.tabs, []);
  }

  function saveTabs(tabs) {
    writeStorage(STORAGE.tabs, tabs);
  }

  function getActiveTab() {
    return readStorage(STORAGE.activeTab, null);
  }

  function setActiveTab(id) {
    writeStorage(STORAGE.activeTab, id);
  }

  function createTab(url = DEFAULTS.homepage, title = "New Tab") {
    const tab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      url,
      createdAt: Date.now()
    };

    const tabs = getTabs();
    tabs.push(tab);

    saveTabs(tabs);
    setActiveTab(tab.id);

    window.dispatchEvent(
      new CustomEvent("musabx:tabCreated", {
        detail: { tab }
      })
    );

    return tab;
  }

  function updateTab(id, changes) {
    const tabs = getTabs();
    const index = tabs.findIndex(tab => tab.id === id);

    if (index === -1) return null;

    tabs[index] = {
      ...tabs[index],
      ...changes
    };

    saveTabs(tabs);

    window.dispatchEvent(
      new CustomEvent("musabx:tabUpdated", {
        detail: { tab: tabs[index] }
      })
    );

    return tabs[index];
  }

  function removeTab(id) {
    let tabs = getTabs();

    tabs = tabs.filter(tab => tab.id !== id);

    saveTabs(tabs);

    if (getActiveTab() === id) {
      const next = tabs[tabs.length - 1];

      if (next) {
        setActiveTab(next.id);
      } else {
        setActiveTab(null);
      }
    }

    window.dispatchEvent(
      new CustomEvent("musabx:tabRemoved", {
        detail: { id }
      })
    );
  }

  function normalizeUrl(input) {
    const value = String(input || "").trim();

    if (!value) {
      return DEFAULTS.homepage;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    // Search queries go to DuckDuckGo.
    if (
      value.includes(" ") ||
      !value.includes(".") ||
      !/^[\w-]+(\.[\w-]+)+/.test(value)
    ) {
      return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(value)}`;
    }

    return `https://${value}`;
  }

  function goTo(path) {
    window.location.href = path;
  }

  function enableFullscreen(element = document.documentElement) {
    if (document.fullscreenElement) {
      return;
    }

    if (element.requestFullscreen) {
      element.requestFullscreen().catch(error => {
        console.warn("MUSABX fullscreen error:", error);
      });
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(error => {
        console.warn("MUSABX fullscreen exit error:", error);
      });
    }
  }

  function isFullscreen() {
    return Boolean(document.fullscreenElement);
  }

  // Expose the shared API.
  window.MUSABX = {
    STORAGE,
    DEFAULTS,

    readStorage,
    writeStorage,

    getSettings,
    saveSettings,

    getFavorites,
    isFavorite,
    toggleFavorite,

    getRecentGames,
    recordGamePlayed,

    getAchievements,
    unlockAchievement,

    getTabs,
    saveTabs,
    getActiveTab,
    setActiveTab,
    createTab,
    updateTab,
    removeTab,

    normalizeUrl,
    goTo,

    enableFullscreen,
    exitFullscreen,
    isFullscreen
  };

  // Make sure a homepage setting always exists.
  if (!localStorage.getItem(STORAGE.settings)) {
    saveSettings(DEFAULTS);
  }

  // Helpful global shortcuts for navigation.
  document.addEventListener("click", event => {
    const link = event.target.closest("[data-musabx-link]");

    if (!link) return;

    event.preventDefault();

    const destination = link.getAttribute("data-musabx-link");

    if (destination) {
      goTo(destination);
    }
  });

  console.log("MUSABX application controller loaded.");
})();
```

