document.addEventListener("DOMContentLoaded", () => {

  /* MOBILE MENU */

  const menuButton = document.getElementById("mobileMenu");

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
    });
  }


  /* FULLSCREEN */

  const fullscreenButton =
    document.getElementById("fullscreenButton");

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", async () => {

      try {

        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }

      } catch (error) {
        console.log("Fullscreen unavailable.");
      }

    });
  }


  /* SEARCH */

  const searchForm =
    document.getElementById("searchForm");

  const searchInput =
    document.getElementById("searchInput");

  if (searchForm && searchInput) {

    searchForm.addEventListener("submit", (event) => {

      event.preventDefault();

      const value = searchInput.value.trim();

      if (!value) return;

      let destination;

      if (
        value.startsWith("http://") ||
        value.startsWith("https://")
      ) {
        destination = value;
      }

      else if (
        value.includes(".") &&
        !value.includes(" ")
      ) {
        destination = "https://" + value;
      }

      else {
        destination =
          "https://duckduckgo.com/?q=" +
          encodeURIComponent(value);
      }

      window.location.href = destination;

    });

  }


  /* SETTINGS STORAGE */

  const toggles =
    document.querySelectorAll("[data-setting]");

  toggles.forEach(toggle => {

    const key = toggle.dataset.setting;

    const saved =
      localStorage.getItem("musabx-" + key);

    if (saved !== null) {
      toggle.checked = saved === "true";
    }

    toggle.addEventListener("change", () => {

      localStorage.setItem(
        "musabx-" + key,
        toggle.checked
      );

    });

  });


  /* SELECT SETTINGS */

  const selects =
    document.querySelectorAll("[data-setting-select]");

  selects.forEach(select => {

    const key = select.dataset.settingSelect;

    const saved =
      localStorage.getItem("musabx-" + key);

    if (saved) {
      select.value = saved;
    }

    select.addEventListener("change", () => {

      localStorage.setItem(
        "musabx-" + key,
        select.value
      );

    });

  });


  /* RESET */

  const resetButton =
    document.getElementById("resetSettings");

  if (resetButton) {

    resetButton.addEventListener("click", () => {

      if (
        confirm(
          "Reset all MUSABX settings?"
        )
      ) {

        Object.keys(localStorage)
          .filter(key => key.startsWith("musabx-"))
          .forEach(key => localStorage.removeItem(key));

        location.reload();

      }

    });

  }

});
