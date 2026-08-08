```javascript
/* =========================================================
   MUSABX GAMES ENGINE
   Different games / different mechanics
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const grid = document.getElementById("gameGrid");
  const categoriesEl = document.getElementById("categoryList");
  const searchEl = document.getElementById("gameSearch");
  const countEl = document.getElementById("gamesCount");

  const modal = document.getElementById("gameModal");
  const closeGame = document.getElementById("closeGame");
  const gameTitle = document.getElementById("gameWindowTitle");
  const gameHelp = document.getElementById("gameHelp");

  const keys = new Set();

  let currentGame = null;
  let animationId = null;
  let lastTime = 0;

  const categories = [
    "All",
    "Action",
    "Adventure",
    "Survival",
    "Racing",
    "Puzzle",
    "Arcade",
    "Platformer",
    "Strategy",
    "Sports"
  ];

  /*
   ========================================================
   GAME DATA
   ========================================================
  */

  const games = [

    /* ================= ACTION ================= */

    {
      id: "meteor-blaster",
      name: "Meteor Blaster",
      category: "Action",
      icon: "☄️",
      description: "Blast falling meteors before they hit your ship.",
      type: "shooter",
      help: "Move with ← → and shoot with Space."
    },

    {
      id: "target-shooter",
      name: "Target Shooter",
      category: "Action",
      icon: "🎯",
      description: "Hit moving targets before the timer expires.",
      type: "target",
      help: "Move your mouse or touch the targets."
    },

    /* ================= SURVIVAL ================= */

    {
      id: "forest-survival",
      name: "Forest Survival",
      category: "Survival",
      icon: "🌲",
      description: "Collect supplies while avoiding the falling rocks.",
      type: "survival",
      help: "Move with WASD or arrow keys. Collect the supplies."
    },

    {
      id: "zombie-escape",
      name: "Zombie Escape",
      category: "Survival",
      icon: "🧟",
      description: "Survive as long as possible while zombies chase you.",
      type: "zombie",
      help: "Move with WASD or arrow keys."
    },

    /* ================= RACING ================= */

    {
      id: "neon-racer",
      name: "Neon Racer",
      category: "Racing",
      icon: "🏎️",
      description: "Dodge traffic and survive as the road gets faster.",
      type: "racing",
      help: "Use ← → to change lanes."
    },

    {
      id: "space-race",
      name: "Space Race",
      category: "Racing",
      icon: "🚀",
      description: "Fly through space and dodge incoming asteroids.",
      type: "space-race",
      help: "Use ← → to steer."
    },

    /* ================= PUZZLE ================= */

    {
      id: "memory-match",
      name: "Memory Match",
      category: "Puzzle",
      icon: "🧠",
      description: "Remember the pattern and repeat it correctly.",
      type: "memory",
      help: "Watch the sequence, then repeat it."
    },

    {
      id: "number-dash",
      name: "Number Dash",
      category: "Puzzle",
      icon: "🔢",
      description: "Click numbers in order as quickly as possible.",
      type: "numbers",
      help: "Click 1, 2, 3... as fast as you can."
    },

    /* ================= ARCADE ================= */

    {
      id: "brick-breaker",
      name: "Brick Breaker",
      category: "Arcade",
      icon: "🧱",
      description: "Break every brick before you lose the ball.",
      type: "breaker",
      help: "Use ← → to move the paddle."
    },

    {
      id: "catch-stars",
      name: "Catch Stars",
      category: "Arcade",
      icon: "⭐",
      description: "Catch falling stars and avoid the bombs.",
      type: "catch",
      help: "Move with ← →."
    },

    /* ================= PLATFORMER ================= */

    {
      id: "jump-run",
      name: "Jump Run",
      category: "Platformer",
      icon: "🏃",
      description: "Jump over obstacles and keep running.",
      type: "runner",
      help: "Press Space or ↑ to jump."
    },

    {
      id: "cave-jumper",
      name: "Cave Jumper",
      category: "Platformer",
      icon: "🪨",
      description: "Jump between platforms and climb higher.",
      type: "jumper",
      help: "Use ← → and Space."
    },

    /* ================= ADVENTURE ================= */

    {
      id: "treasure-hunt",
      name: "Treasure Hunt",
      category: "Adventure",
      icon: "💎",
      description: "Explore the map and find the hidden treasure.",
      type: "treasure",
      help: "Use arrow keys to explore."
    },

    {
      id: "maze-escape",
      name: "Maze Escape",
      category: "Adventure",
      icon: "🗺️",
      description: "Find your way through the maze.",
      type: "maze",
      help: "Use the arrow keys."
    },

    /* ================= STRATEGY ================= */

    {
      id: "defense-grid",
      name: "Defense Grid",
      category: "Strategy",
      icon: "🛡️",
      description: "Stop enemies before they reach your base.",
      type: "defense",
      help: "Click the enemies to stop them."
    },

    {
      id: "coin-planner",
      name: "Coin Planner",
      category: "Strategy",
      icon: "🪙",
      description: "Choose upgrades wisely and build your score.",
      type: "strategy",
      help: "Choose the best upgrade each round."
    },

    /* ================= SPORTS ================= */

    {
      id: "penalty-kick",
      name: "Penalty Kick",
      category: "Sports",
      icon: "⚽",
      description: "Score as many penalty kicks as possible.",
      type: "football",
      help: "Click where you want to shoot."
    },

    {
      id: "basket-shot",
      name: "Basket Shot",
      category: "Sports",
      icon: "🏀",
      description: "Time your shot and score baskets.",
      type: "basket",
      help: "Press Space when the power bar is high."
    }

  ];

  let selectedCategory = "All";
  let searchText = "";

  /*
   ========================================================
   GENERAL UI
   ========================================================
  */

  function getFavorites() {
    return window.MUSABX
      ? MUSABX.getFavorites()
      : [];
  }

  function isFavorite(id) {
    return getFavorites().includes(id);
  }

  function renderCategories() {
    categoriesEl.innerHTML = "";

    categories.forEach(category => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        "category-button" +
        (category === selectedCategory
          ? " active"
          : "");

      button.textContent = category;

      button.addEventListener("click", () => {
        selectedCategory = category;
        renderCategories();
        renderGames();
      });

      categoriesEl.appendChild(button);
    });
  }

  function getFilteredGames() {
    return games.filter(game => {
      const categoryMatch =
        selectedCategory === "All" ||
        game.category === selectedCategory;

      const searchMatch =
        !searchText ||
        game.name
          .toLowerCase()
          .includes(searchText) ||
        game.description
          .toLowerCase()
          .includes(searchText) ||
        game.category
          .toLowerCase()
          .includes(searchText);

      return categoryMatch && searchMatch;
    });
  }

  function renderGames() {
    const visibleGames = getFilteredGames();

    countEl.textContent =
      `${visibleGames.length} game${
        visibleGames.length === 1 ? "" : "s"
      }`;

    grid.innerHTML = "";

    if (visibleGames.length === 0) {
      grid.innerHTML = `
        <div class="empty-games">
          No games match your search.
        </div>
      `;

      return;
    }

    visibleGames.forEach(game => {
      const card = document.createElement("article");

      card.className = "game-card";

      const favorite =
        isFavorite(game.id);

      card.innerHTML = `
        <div class="game-cover">
          ${game.icon}
        </div>

        <div class="game-info">

          <span class="game-category">
            ${game.category}
          </span>

          <h2 class="game-name">
            ${game.name}
          </h2>

          <p class="game-description">
            ${game.description}
          </p>

          <div class="game-actions">

            <button
              type="button"
              class="play-button"
              data-play="${game.id}"
            >
              Play
            </button>

            <button
              type="button"
              class="favorite-button ${
                favorite ? "active" : ""
              }"
              data-favorite="${game.id}"
              aria-label="Favorite ${game.name}"
            >
              ${favorite ? "★" : "☆"}
            </button>

          </div>

        </div>
      `;

      grid.appendChild(card);
    });

    grid
      .querySelectorAll("[data-play]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            launchGame(button.dataset.play);
          }
        );
      });

    grid
      .querySelectorAll("[data-favorite]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            toggleFavorite(
              button.dataset.favorite
            );
          }
        );
      });
  }

  function toggleFavorite(id) {
    if (!window.MUSABX) return;

    MUSABX.toggleFavorite(id);
    renderGames();
  }

  searchEl.addEventListener("input", () => {
    searchText =
      searchEl.value.trim().toLowerCase();

    renderGames();
  });

  /*
   ========================================================
   GAME START / STOP
   ========================================================
  */

  function findGame(id) {
    return games.find(
      game => game.id === id
    );
  }

  function launchGame(id) {
    const game = findGame(id);

    if (!game) return;

    currentGame = game;

    if (window.MUSABX) {
      MUSABX.recordGamePlayed(id);
      MUSABX.unlockAchievement("first-game");
    }

    gameTitle.textContent = game.name;
    gameHelp.textContent = game.help;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    resetCanvas();

    startGame(game);
  }

  function closeCurrentGame() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    stopGame();

    currentGame = null;
  }

  closeGame.addEventListener(
    "click",
    closeCurrentGame
  );

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeCurrentGame();
    }
  });

  document.addEventListener(
    "keydown",
    event => {
      keys.add(event.key.toLowerCase());

      if (
        event.key === "Escape" &&
        modal.classList.contains("open")
      ) {
        closeCurrentGame();
      }
    }
  );

  document.addEventListener(
    "keyup",
    event => {
      keys.delete(event.key.toLowerCase());
    }
  );

  function resetCanvas() {
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#030711";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  function stopGame() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    lastTime = 0;
  }

  function startLoop(update, draw) {
    stopGame();

    function loop(time) {
      if (!currentGame) return;

      if (!lastTime) {
        lastTime = time;
      }

      const dt = Math.min(
        (time - lastTime) / 1000,
        0.05
      );

      lastTime = time;

      update(dt);
      draw();

      animationId =
        requestAnimationFrame(loop);
    }

    animationId =
      requestAnimationFrame(loop);
  }

  /*
   ========================================================
   SIMPLE DRAW HELPERS
   ========================================================
  */

  function text(textValue, x, y, size = 20) {
    ctx.fillStyle = "#eef5ff";
    ctx.font = `${size}px system-ui`;
    ctx.fillText(textValue, x, y);
  }

  function circle(x, y, r, fill = "#61dafb") {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function rect(x, y, w, h, fill = "#61dafb") {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  /*
   ========================================================
   GAME DISPATCHER
   ========================================================
  */

  function startGame(game) {
    switch (game.type) {
      case "shooter":
        gameShooter();
        break;

      case "target":
        gameTarget();
        break;

      case "survival":
        gameSurvival();
        break;

      case "zombie":
        gameZombie();
        break;

      case "racing":
        gameRacing();
        break;

      case "space-race":
        gameSpaceRace();
        break;

      case "memory":
        gameMemory();
        break;

      case "numbers":
        gameNumbers();
        break;

      case "breaker":
        gameBreaker();
        break;

      case "catch":
        gameCatch();
        break;

      case "runner":
        gameRunner();
        break;

      case "jumper":
        gameJumper();
        break;

      case "treasure":
        gameTreasure();
        break;

      case "maze":
        gameMaze();
        break;

      case "defense":
        gameDefense();
        break;

      case "strategy":
        gameStrategy();
        break;

      case "football":
        gameFootball();
        break;

      case "basket":
        gameBasket();
        break;

      default:
        gameNumbers();
    }
  }

  /*
   ========================================================
   ACTION — METEOR BLASTER
   ========================================================
  */

  function gameShooter() {
    const player = {
      x: 380,
      y: 440,
      speed: 360
    };

    let bullets = [];
    let meteors = [];
    let score = 0;
    let spawn = 0;
    let shootCooldown = 0;
    let gameOver = false;

    function reset() {
      bullets = [];
      meteors = [];
      score = 0;
      spawn = 0;
      shootCooldown = 0;
      gameOver = false;
      player.x = 380;
    }

    reset();

    function update(dt) {
      if (gameOver) {
        return;
      }

      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        player.x -=
          player.speed * dt;
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        player.x +=
          player.speed * dt;
      }

      player.x =
        Math.max(
          25,
          Math.min(775, player.x)
        );

      shootCooldown -= dt;

      if (
        keys.has(" ") &&
        shootCooldown <= 0
      ) {
        bullets.push({
          x: player.x,
          y: player.y
        });

        shootCooldown = 0.2;
      }

      bullets.forEach(
        bullet => {
          bullet.y -= 500 * dt;
        }
      );

      bullets =
        bullets.filter(
          bullet => bullet.y > -20
        );

      spawn -= dt;

      if (spawn <= 0) {
        meteors.push({
          x: 30 + Math.random() * 740,
          y: -30,
          r: 15 + Math.random() * 15,
          speed: 100 + Math.random() * 130
        });

        spawn =
          Math.max(
            0.25,
            0.8 - score * 0.005
          );
      }

      meteors.forEach(
        meteor => {
          meteor.y +=
            meteor.speed * dt;
        }
      );

      bullets.forEach(
        bullet => {
          meteors.forEach(
            meteor => {
              const dx =
                bullet.x - meteor.x;

              const dy =
                bullet.y - meteor.y;

              if (
                Math.hypot(dx, dy) <
                meteor.r
              ) {
                meteor.dead = true;
                bullet.dead = true;
                score++;
              }
            }
          );
        }
      );

      meteors =
        meteors.filter(
          meteor => {
            if (meteor.dead) {
              return false;
            }

            if (
              meteor.y >
              player.y - 10
            ) {
              gameOver = true;
            }

            return true;
          }
        );

      bullets =
        bullets.filter(
          bullet => !bullet.dead
        );
    }

    function draw() {
      resetCanvas();

      text(
        `Score: ${score}`,
        20,
        30
      );

      rect(
        player.x - 16,
        player.y - 12,
        32,
        24
      );

      meteors.forEach(
        meteor => {
          circle(
            meteor.x,
            meteor.y,
            meteor.r,
            "#a6b8d7"
          );
        }
      );

      bullets.forEach(
        bullet => {
          rect(
            bullet.x - 2,
            bullet.y,
            4,
            12,
            "#ffffff"
          );
        }
      );

      if (gameOver) {
        text(
          "GAME OVER",
          315,
          235,
          40
        );

        text(
          `Final Score: ${score}`,
          320,
          270
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   ACTION — TARGET SHOOTER
   ========================================================
  */

  function gameTarget() {
    let target = {
      x: 400,
      y: 250,
      r: 30
    };

    let score = 0;
    let time = 30;
    let over = false;

    function moveTarget() {
      target.x =
        50 +
        Math.random() * 700;

      target.y =
        70 +
        Math.random() * 380;
    }

    canvas.onclick = event => {
      if (over) return;

      const rectBounds =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rectBounds.left) *
        (canvas.width /
          rectBounds.width);

      const y =
        (event.clientY -
          rectBounds.top) *
        (canvas.height /
          rectBounds.height);

      if (
        Math.hypot(
          x - target.x,
          y - target.y
        ) < target.r
      ) {
        score++;
        moveTarget();
      }
    };

    function update(dt) {
      if (over) return;

      time -= dt;

      if (time <= 0) {
        time = 0;
        over = true;
      }
    }

    function draw() {
      resetCanvas();

      text(
        `Score: ${score}`,
        20,
        30
      );

      text(
        `Time: ${Math.ceil(time)}`,
        680,
        30
      );

      circle(
        target.x,
        target.y,
        target.r,
        "#61dafb"
      );

      circle(
        target.x,
        target.y,
        target.r * 0.55,
        "#07101e"
      );

      circle(
        target.x,
        target.y,
        target.r * 0.2,
        "#61dafb"
      );

      if (over) {
        text(
          "TIME!",
          350,
          240,
          44
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   SURVIVAL — FOREST
   ========================================================
  */

  function gameSurvival() {
    const player = {
      x: 400,
      y: 250,
      speed: 220
    };

    let supplies = [];
    let rocks = [];
    let score = 0;
    let spawn = 0;

    function update(dt) {
      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        player.x -=
          player.speed * dt;
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        player.x +=
          player.speed * dt;
      }

      if (
        keys.has("arrowup") ||
        keys.has("w")
      ) {
        player.y -=
          player.speed * dt;
      }

      if (
        keys.has("arrowdown") ||
        keys.has("s")
      ) {
        player.y +=
          player.speed * dt;
      }

      player.x =
        Math.max(
          20,
          Math.min(780, player.x)
        );

      player.y =
        Math.max(
          50,
          Math.min(480, player.y)
        );

      spawn -= dt;

      if (spawn <= 0) {
        supplies.push({
          x: 40 + Math.random() * 720,
          y: 70 + Math.random() * 380
        });

        rocks.push({
          x: 40 + Math.random() * 720,
          y: -20,
          speed: 100 + Math.random() * 120
        });

        spawn = 1;
      }

      rocks.forEach(
        rock => {
          rock.y +=
            rock.speed * dt;
        }
      );

      supplies =
        supplies.filter(item => {
          if (
            Math.hypot(
              item.x - player.x,
              item.y - player.y
            ) < 24
          ) {
            score++;
            return false;
          }

          return true;
        });

      rocks.forEach(rock => {
        if (
          Math.hypot(
            rock.x - player.x,
            rock.y - player.y
          ) < 25
        ) {
          score = Math.max(
            0,
            score - 1
          );

          rock.y = 600;
        }
      });

      rocks =
        rocks.filter(
          rock => rock.y < 550
        );
    }

    function draw() {
      resetCanvas();

      text(
        `Supplies: ${score}`,
        20,
        30
      );

      /*
        Simple forest background.
      */
      for (let x = 20; x < 800; x += 80) {
        text("🌲", x, 90, 28);
        text("🌲", x + 30, 470, 28);
      }

      circle(
        player.x,
        player.y,
        18,
        "#61dafb"
      );

      supplies.forEach(
        item => {
          text(
            "🥫",
            item.x - 10,
            item.y + 8,
            22
          );
        }
      );

      rocks.forEach(
        rock => {
          circle(
            rock.x,
            rock.y,
            14,
            "#8d9ab0"
          );
        }
      );
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   SURVIVAL — ZOMBIE ESCAPE
   ========================================================
  */

  function gameZombie() {
    const player = {
      x: 400,
      y: 250,
      speed: 230
    };

    const zombies = [];

    let spawn = 0;
    let time = 0;
    let gameOver = false;

    function update(dt) {
      if (gameOver) return;

      time += dt;

      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        player.x -=
          player.speed * dt;
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        player.x +=
          player.speed * dt;
      }

      if (
        keys.has("arrowup") ||
        keys.has("w")
      ) {
        player.y -=
          player.speed * dt;
      }

      if (
        keys.has("arrowdown") ||
        keys.has("s")
      ) {
        player.y +=
          player.speed * dt;
      }

      player.x =
        Math.max(
          15,
          Math.min(785, player.x)
        );

      player.y =
        Math.max(
          45,
          Math.min(485, player.y)
        );

      spawn -= dt;

      if (spawn <= 0) {
        const side =
          Math.floor(
            Math.random() * 4
          );

        let x;
        let y;

        if (side === 0) {
          x = 0;
          y = Math.random() * 500;
        } else if (side === 1) {
          x = 800;
          y = Math.random() * 500;
        } else if (side === 2) {
          x = Math.random() * 800;
          y = 0;
        } else {
          x = Math.random() * 800;
          y = 500;
        }

        zombies.push({
          x,
          y,
          speed: 45 + time * 1.5
        });

        spawn =
          Math.max(
            0.25,
            1 - time * 0.02
          );
      }

      zombies.forEach(
        zombie => {
          const dx =
            player.x - zombie.x;

          const dy =
            player.y - zombie.y;

          const distance =
            Math.hypot(dx, dy) || 1;

          zombie.x +=
            (dx / distance) *
            zombie.speed *
            dt;

          zombie.y +=
            (dy / distance) *
            zombie.speed *
            dt;

          if (distance < 25) {
            gameOver = true;
          }
        }
      );
    }

    function draw() {
      resetCanvas();

      text(
        `Survival: ${Math.floor(time)}s`,
        20,
        30
      );

      circle(
        player.x,
        player.y,
        17,
        "#61dafb"
      );

      zombies.forEach(
        zombie => {
          text(
            "🧟",
            zombie.x - 12,
            zombie.y + 12,
            24
          );
        }
      );

      if (gameOver) {
        text(
          "YOU GOT CAUGHT",
          265,
          235,
          34
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   RACING
   ========================================================
  */

  function gameRacing() {
    let lane = 1;
    let score = 0;
    let speed = 260;
    let cars = [];
    let spawn = 0;
    let over = false;

    function update(dt) {
      if (over) return;

      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        lane = Math.max(
          0,
          lane - 1
        );

        keys.delete("arrowleft");
        keys.delete("a");
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        lane = Math.min(
          2,
          lane + 1
        );

        keys.delete("arrowright");
        keys.delete("d");
      }

      score += dt;

      speed += dt * 4;

      spawn -= dt;

      if (spawn <= 0) {
        cars.push({
          lane:
            Math.floor(
              Math.random() * 3
            ),
          y: -80
        });

        spawn = .75;
      }

      cars.forEach(
        car => {
          car.y +=
            speed * dt;
        }
      );

      cars.forEach(car => {
        if (
          car.lane === lane &&
          car.y > 390 &&
          car.y < 470
        ) {
          over = true;
        }
      });

      cars =
        cars.filter(
          car => car.y < 560
        );
    }

    function draw() {
      resetCanvas();

      text(
        `Distance: ${Math.floor(score * 10)}`,
        20,
        30
      );

      /*
        Road.
      */
      rect(
        180,
        0,
        440,
        500,
        "#111a2a"
      );

      for (let x of [326, 473]) {
        for (
          let y = -40;
          y < 500;
          y += 80
        ) {
          rect(
            x,
            y + ((score * 100) % 80),
            6,
            40,
            "#a6b8d7"
          );
        }
      }

      rect(
        235 + lane * 147,
        420,
        55,
        80
      );

      cars.forEach(car => {
        rect(
          235 + car.lane * 147,
          car.y,
          55,
          70,
          "#8d9ab0"
        );
      });

      if (over) {
        text(
          "CRASH!",
          345,
          250,
          45
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   SPACE RACE
   ========================================================
  */

  function gameSpaceRace() {
    let x = 400;
    let score = 0;
    let obstacles = [];
    let spawn = 0;
    let over = false;

    function update(dt) {
      if (over) return;

      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        x -= 280 * dt;
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        x += 280 * dt;
      }

      x =
        Math.max(
          20,
          Math.min(780, x)
        );

      score += dt;

      spawn -= dt;

      if (spawn <= 0) {
        obstacles.push({
          x:
            30 +
            Math.random() * 740,
          y: -40,
          speed:
            130 +
            Math.random() * 150
        });

        spawn = .6;
      }

      obstacles.forEach(
        item => {
          item.y +=
            item.speed * dt;
        }
      );

      obstacles.forEach(
        item => {
          if (
            Math.hypot(
              item.x - x,
              item.y - 440
            ) < 28
          ) {
            over = true;
          }
        }
      );

      obstacles =
        obstacles.filter(
          item => item.y < 550
        );
    }

    function draw() {
      resetCanvas();

      text(
        `Flight: ${Math.floor(score)}s`,
        20,
        30
      );

      circle(
        x,
        440,
        16
      );

      obstacles.forEach(
        item => {
          text(
            "☄️",
            item.x - 12,
            item.y + 10,
            25
          );
        }
      );

      if (over) {
        text(
          "SPACE CRASH",
          280,
          250,
          40
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   PUZZLE — MEMORY
   ========================================================
  */

  function gameMemory() {
    let sequence = [];
    let input = [];
    let level = 1;
    let showing = true;
    let index = 0;
    let timer = 0;
    let message = "Watch the sequence.";

    function newRound() {
      sequence = [];

      for (
        let i = 0;
        i < level + 2;
        i++
      ) {
        sequence.push(
          Math.floor(
            Math.random() * 4
          )
        );
      }

      input = [];
      index = 0;
      showing = true;
      timer = 0;
      message =
        "Watch the sequence.";
    }

    newRound();

    canvas.onclick = event => {
      if (showing) return;

      const rectBounds =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rectBounds.left) *
        (canvas.width /
          rectBounds.width);

      const y =
        (event.clientY -
          rectBounds.top) *
        (canvas.height /
          rectBounds.height);

      let clicked = -1;

      if (
        x < 400 &&
        y < 250
      ) clicked = 0;

      if (
        x >= 400 &&
        y < 250
      ) clicked = 1;

      if (
        x < 400 &&
        y >= 250
      ) clicked = 2;

      if (
        x >= 400 &&
        y >= 250
      ) clicked = 3;

      input.push(clicked);

      const position =
        input.length - 1;

      if (
        input[position] !==
        sequence[position]
      ) {
        message =
          "Wrong! Try again.";

        level = 1;

        setTimeout(
          newRound,
          700
        );

        return;
      }

      if (
        input.length ===
        sequence.length
      ) {
        level++;

        message =
          "Correct! Next level.";

        setTimeout(
          newRound,
          700
        );
      }
    };

    function update(dt) {
      if (showing) {
        timer += dt;

        if (timer > 2.2) {
          showing = false;
          timer = 0;
          message =
            "Repeat the sequence.";
        }
      }
    }

    function draw() {
      resetCanvas();

      text(
        `Level: ${level}`,
        20,
        30
      );

      text(
        message,
        285,
        30
      );

      const colors = [
        "#61dafb",
        "#4dd0e1",
        "#8da2bd",
        "#eef5ff"
      ];

      for (
        let i = 0;
        i < 4;
        i++
      ) {
        const x =
          i % 2 === 0
            ? 120
            : 450;

        const y =
          i < 2
            ? 100
            : 310;

        let visible =
          false;

        if (showing) {
          const elapsed =
            timer;

          const pos =
            Math.floor(
              elapsed / .45
            );

          visible =
            sequence[pos] === i;
        }

        rect(
          x,
          y,
          220,
          130,
          visible
            ? colors[i]
            : "#17243a"
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   PUZZLE — NUMBER DASH
   ========================================================
  */

  function gameNumbers() {
    let numbers = [];
    let next = 1;
    let start = performance.now();
    let done = false;

    function createNumbers() {
      numbers = [];

      for (
        let i = 1;
        i <= 20;
        i++
      ) {
        numbers.push({
          value: i,
          x:
            40 +
            Math.random() * 700,
          y:
            70 +
            Math.random() * 390
        });
      }
    }

    createNumbers();

    canvas.onclick = event => {
      if (done) return;

      const rectBounds =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rectBounds.left) *
        (canvas.width /
          rectBounds.width);

      const y =
        (event.clientY -
          rectBounds.top) *
        (canvas.height /
          rectBounds.height);

      const item =
        numbers.find(
          number =>
            Math.hypot(
              number.x - x,
              number.y - y
            ) < 25
        );

      if (!item) return;

      if (item.value === next) {
        item.clicked = true;
        next++;

        if (next > 20) {
          done = true;
        }
      }
    };

    function update() {}

    function draw() {
      resetCanvas();

      text(
        `Next: ${next}`,
        20,
        30
      );

      numbers.forEach(
        item => {
          if (!item.clicked) {
            circle(
              item.x,
              item.y,
              24
            );

            ctx.fillStyle =
              "#07101e";

            ctx.font =
              "16px system-ui";

            ctx.textAlign =
              "center";

            ctx.fillText(
              item.value,
              item.x,
              item.y + 6
            );

            ctx.textAlign =
              "left";
          }
        }
      );

      if (done) {
        const time =
          (
            performance.now() -
            start
          ) / 1000;

        text(
          `Finished in ${time.toFixed(2)}s`,
          275,
          250,
          30
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   ARCADE — BRICK BREAKER
   ========================================================
  */

  function gameBreaker() {
    let paddleX = 340;
    let ball = {
      x: 400,
      y: 420,
      vx: 190,
      vy: -190
    };

    let bricks = [];

    for (
      let row = 0;
      row < 4;
      row++
    ) {
      for (
        let col = 0;
        col < 8;
        col++
      ) {
        bricks.push({
          x: 80 + col * 82,
          y: 70 + row * 30,
          w: 65,
          h: 18
        });
      }
    }

    let lives = 3;

    function update(dt) {
      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        paddleX -=
          350 * dt;
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        paddleX +=
          350 * dt;
      }

      paddleX =
        Math.max(
          10,
          Math.min(
            670,
            paddleX
          )
        );

      ball.x +=
        ball.vx * dt;

      ball.y +=
        ball.vy * dt;

      if (
        ball.x < 10 ||
        ball.x > 790
      ) {
        ball.vx *= -1;
      }

      if (ball.y < 40) {
        ball.vy *= -1;
      }

      if (
        ball.y > 420 &&
        ball.y < 455 &&
        ball.x >
          paddleX &&
        ball.x <
          paddleX + 120
      ) {
        ball.vy = -Math.abs(
          ball.vy
        );
      }

      bricks.forEach(
        brick => {
          if (
            brick.dead
          ) return;

          if (
            ball.x >
              brick.x &&
            ball.x <
              brick.x +
                brick.w &&
            ball.y >
              brick.y &&
            ball.y <
              brick.y +
                brick.h
          ) {
            brick.dead = true;
            ball.vy *= -1;
          }
        }
      );

      bricks =
        bricks.filter(
          brick => !brick.dead
        );

      if (ball.y > 520) {
        lives--;

        ball.x = 400;
        ball.y = 420;
        ball.vy = -190;

        if (lives <= 0) {
          ball.vx = 0;
          ball.vy = 0;
        }
      }
    }

    function draw() {
      resetCanvas();

      text(
        `Lives: ${lives}`,
        20,
        30
      );

      bricks.forEach(
        brick => {
          rect(
            brick.x,
            brick.y,
            brick.w,
            brick.h
          );
        }
      );

      rect(
        paddleX,
        440,
        120,
        15,
        "#eef5ff"
      );

      circle(
        ball.x,
        ball.y,
        8,
        "#eef5ff"
      );

      if (
        bricks.length === 0
      ) {
        text(
          "YOU WIN!",
          320,
          250,
          45
        );
      }

      if (
        lives <= 0
      ) {
        text(
          "GAME OVER",
          300,
          250,
          40
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   ARCADE — CATCH STARS
   ========================================================
  */

  function gameCatch() {
    let x = 400;
    let score = 0;
    let objects = [];
    let spawn = 0;
    let over = false;

    function update(dt) {
      if (over) return;

      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        x -= 320 * dt;
      }

      if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        x += 320 * dt;
      }

      x =
        Math.max(
          20,
          Math.min(780, x)
        );

      spawn -= dt;

      if (spawn <= 0) {
        objects.push({
          x:
            20 +
            Math.random() * 760,
          y: -20,
          bomb:
            Math.random() < .2,
          speed:
            120 +
            Math.random() * 100
        });

        spawn = .45;
      }

      objects.forEach(
        object => {
          object.y +=
            object.speed * dt;

          if (
            Math.hypot(
              object.x - x,
              object.y - 450
            ) < 30
          ) {
            if (object.bomb) {
              over = true;
            } else {
              score++;
              object.dead = true;
            }
          }
        }
      );

      objects =
        objects.filter(
          object =>
            !object.dead &&
            object.y < 540
        );
    }

    function draw() {
      resetCanvas();

      text(
        `Stars: ${score}`,
        20,
        30
      );

      rect(
        x - 30,
        440,
        60,
        20
      );

      objects.forEach(
        object => {
          text(
            object.bomb
              ? "💣"
              : "⭐",
            object.x - 12,
            object.y + 10,
            24
          );
        }
      );

      if (over) {
        text(
          "BOOM!",
          345,
          250,
          45
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   PLATFORMER — RUNNER
   ========================================================
  */

  function gameRunner() {
    let player = {
      x: 100,
      y: 400,
      vy: 0,
      jumping: false
    };

    let obstacleX = 800;
    let score = 0;
    let over = false;

    function update(dt) {
      if (over) return;

      if (
        (
          keys.has(" ") ||
          keys.has("arrowup")
        ) &&
        !player.jumping
      ) {
        player.vy = -520;
        player.jumping = true;
      }

      player.vy +=
        1100 * dt;

      player.y +=
        player.vy * dt;

      if (player.y >= 400) {
        player.y = 400;
        player.vy = 0;
        player.jumping = false;
      }

      obstacleX -=
        320 * dt;

      if (obstacleX < -40) {
        obstacleX = 800;
        score++;
      }

      if (
        obstacleX < 135 &&
        obstacleX > 70 &&
        player.y > 360
      ) {
        over = true;
      }
    }

    function draw() {
      resetCanvas();

      text(
        `Score: ${score}`,
        20,
        30
      );

      rect(
        0,
        440,
        800,
        4,
        "#a6b8d7"
      );

      rect(
        player.x,
        player.y,
        35,
        40
      );

      rect(
        obstacleX,
        400,
        30,
        40,
        "#8d9ab0"
      );

      if (over) {
        text(
          "RUN OVER",
          315,
          250,
          42
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   PLATFORMER — CAVE JUMPER
   ========================================================
  */

  function gameJumper() {
    let player = {
      x: 400,
      y: 400,
      vx: 0,
      vy: 0
    };

    let platforms = [
      { x: 300, y: 450, w: 200 },
      { x: 100, y: 350, w: 180 },
      { x: 400, y: 250, w: 180 },
      { x: 180, y: 150, w: 180 }
    ];

    let score = 0;

    function update(dt) {
      if (
        keys.has("arrowleft") ||
        keys.has("a")
      ) {
        player.vx = -180;
      } else if (
        keys.has("arrowright") ||
        keys.has("d")
      ) {
        player.vx = 180;
      } else {
        player.vx = 0;
      }

      player.x +=
        player.vx * dt;

      player.vy +=
        1000 * dt;

      player.y +=
        player.vy * dt;

      if (
        (
          keys.has(" ") ||
          keys.has("arrowup")
        ) &&
        player.vy === 0
      ) {
        player.vy = -470;
      }

      player.x =
        Math.max(
          0,
          Math.min(
            765,
            player.x
          )
        );

      platforms.forEach(
        platform => {
          if (
            player.vy >= 0 &&
            player.x + 25 >
              platform.x &&
            player.x <
              platform.x +
                platform.w &&
            player.y + 40 >
              platform.y &&
            player.y + 40 <
              platform.y + 30
          ) {
            player.y =
              platform.y - 40;

            player.vy = 0;
            score++;
          }
        }
      );

      if (player.y > 520) {
        player.x = 400;
        player.y = 400;
        player.vy = 0;
      }
    }

    function draw() {
      resetCanvas();

      text(
        `Height: ${score}`,
        20,
        30
      );

      platforms.forEach(
        platform => {
          rect(
            platform.x,
            platform.y,
            platform.w,
            20
          );
        }
      );

      rect(
        player.x,
        player.y,
        25,
        40
      );
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   ADVENTURE — TREASURE
   ========================================================
  */

  function gameTreasure() {
    let player = {
      x: 100,
      y: 100,
      speed: 220
    };

    let treasure = {
      x: 700,
      y: 400
    };

    let found = false;

    function update(dt) {
      if (found) return;

      if (
        keys.has("arrowleft")
      ) {
        player.x -=
          player.speed * dt;
      }

      if (
        keys.has("arrowright")
      ) {
        player.x +=
          player.speed * dt;
      }

      if (
        keys.has("arrowup")
      ) {
        player.y -=
          player.speed * dt;
      }

      if (
        keys.has("arrowdown")
      ) {
        player.y +=
          player.speed * dt;
      }

      player.x =
        Math.max(
          20,
          Math.min(780, player.x)
        );

      player.y =
        Math.max(
          50,
          Math.min(480, player.y)
        );

      if (
        Math.hypot(
          player.x - treasure.x,
          player.y - treasure.y
        ) < 35
      ) {
        found = true;
      }
    }

    function draw() {
      resetCanvas();

      text(
        "Find the treasure!",
        20,
        30
      );

      circle(
        player.x,
        player.y,
        16
      );

      text(
        "💎",
        treasure.x - 15,
        treasure.y + 12,
        28
      );

      if (found) {
        text(
          "TREASURE FOUND!",
          250,
          250,
          38
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   ADVENTURE — MAZE
   ========================================================
  */

  function gameMaze() {
    const cell = 50;

    const maze = [
      "1111111111111111",
      "1000000000000001",
      "1011110111111101",
      "1000010100000101",
      "1111010111110101",
      "1000010000010101",
      "1011111111010101",
      "1010000000010101",
      "1010111111110101",
      "1010000000000001",
      "1011111111111101",
      "1000000000000001",
      "1111111111111111"
    ];

    let player = {
      x: 1,
      y: 1
    };

    const exit = {
      x: 14,
      y: 11
    };

    function canMove(x, y) {
      return (
        maze[y] &&
        maze[y][x] === "0"
      );
    }

    function update() {
      let nx = player.x;
      let ny = player.y;

      if (
        keys.has("arrowleft")
      ) {
        nx--;
        keys.delete("arrowleft");
      }

      if (
        keys.has("arrowright")
      ) {
        nx++;
        keys.delete("arrowright");
      }

      if (
        keys.has("arrowup")
      ) {
        ny--;
        keys.delete("arrowup");
      }

      if (
        keys.has("arrowdown")
      ) {
        ny++;
        keys.delete("arrowdown");
      }

      if (canMove(nx, ny)) {
        player.x = nx;
        player.y = ny;
      }
    }

    function draw() {
      resetCanvas();

      maze.forEach(
        (row, y) => {
          [...row].forEach(
            (value, x) => {
              if (value === "1") {
                rect(
                  x * cell,
                  y * cell,
                  cell,
                  cell,
                  "#17243a"
                );
              }
            }
          );
        }
      );

      circle(
        player.x * cell + 25,
        player.y * cell + 25,
        15
      );

      text(
        "💎",
        exit.x * cell + 10,
        exit.y * cell + 38,
        30
      );

      if (
        player.x === exit.x &&
        player.y === exit.y
      ) {
        text(
          "ESCAPED!",
          320,
          250,
          40
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   STRATEGY — DEFENSE
   ========================================================
  */

  function gameDefense() {
    let enemies = [];
    let score = 0;
    let spawn = 0;
    let base = 3;
    let over = false;

    function update(dt) {
      if (over) return;

      spawn -= dt;

      if (spawn <= 0) {
        enemies.push({
          x: 0,
          y:
            80 +
            Math.random() * 350,
          speed:
            60 +
            Math.random() * 60
        });

        spawn = .8;
      }

      enemies.forEach(
        enemy => {
          enemy.x +=
            enemy.speed * dt;

          if (enemy.x > 760) {
            enemy.dead = true;
            base--;
          }
        }
      );

      if (base <= 0) {
        over = true;
      }

      /*
        Mouse click destroys nearest enemy.
      */
    }

    canvas.onclick = event => {
      if (over) return;

      const rectBounds =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rectBounds.left) *
        (canvas.width /
          rectBounds.width);

      const y =
        (event.clientY -
          rectBounds.top) *
        (canvas.height /
          rectBounds.height);

      let closest = null;
      let distance = Infinity;

      enemies.forEach(
        enemy => {
          const d =
            Math.hypot(
              enemy.x - x,
              enemy.y - y
            );

          if (d < distance) {
            distance = d;
            closest = enemy;
          }
        }
      );

      if (
        closest &&
        distance < 40
      ) {
        closest.dead = true;
        score++;
      }
    };

    function draw() {
      resetCanvas();

      text(
        `Base: ${base}   Score: ${score}`,
        20,
        30
      );

      rect(
        750,
        70,
        30,
        380
      );

      enemies.forEach(
        enemy => {
          circle(
            enemy.x,
            enemy.y,
            17,
            "#8d9ab0"
          );
        }
      );

      enemies =
        enemies.filter(
          enemy => !enemy.dead
        );

      if (over) {
        text(
          "BASE DESTROYED",
          260,
          250,
          38
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   STRATEGY — COIN PLANNER
   ========================================================
  */

  function gameStrategy() {
    let coins = 10;
    let round = 1;
    let income = 1;
    let over = false;

    canvas.onclick = event => {
      if (over) return;

      const rectBounds =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rectBounds.left) *
        (canvas.width /
          rectBounds.width);

      if (x < 270) {
        if (coins >= 5) {
          coins -= 5;
          income++;
        }
      } else if (x < 530) {
        coins += income;
        round++;
      } else {
        if (coins >= 8) {
          coins -= 8;
          income += 3;
        }
      }

      if (round >= 15) {
        over = true;
      }
    };

    function update() {}

    function draw() {
      resetCanvas();

      text(
        `Round: ${round}`,
        20,
        30
      );

      text(
        `Coins: ${coins}`,
        20,
        60
      );

      text(
        `Income: ${income}`,
        20,
        90
      );

      rect(
        60,
        200,
        210,
        100
      );

      rect(
        295,
        200,
        210,
        100
      );

      rect(
        530,
        200,
        210,
        100
      );

      text(
        "Upgrade +1",
        105,
        255
      );

      text(
        "Collect",
        365,
        255
      );

      text(
        "Upgrade +3",
        570,
        255
      );

      if (over) {
        text(
          "STRATEGY COMPLETE!",
          250,
          370,
          32
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   SPORTS — PENALTY KICK
   ========================================================
  */

  function gameFootball() {
    let shots = 0;
    let goals = 0;
    let keeper = 400;
    let direction = 1;

    function update(dt) {
      keeper +=
        direction *
        180 *
        dt;

      if (
        keeper < 300 ||
        keeper > 500
      ) {
        direction *= -1;
      }
    }

    canvas.onclick = event => {
      if (shots >= 10) return;

      shots++;

      const rectBounds =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rectBounds.left) *
        (canvas.width /
          rectBounds.width);

      if (
        Math.abs(
          x - keeper
        ) > 50
      ) {
        goals++;
      }
    };

    function draw() {
      resetCanvas();

      text(
        `Goals: ${goals}/${shots}`,
        20,
        30
      );

      rect(
        200,
        90,
        400,
        300,
        "#17243a"
      );

      rect(
        keeper - 25,
        115,
        50,
        20,
        "#eef5ff"
      );

      circle(
        400,
        430,
        15
      );

      if (shots >= 10) {
        text(
          `Final: ${goals}/10`,
          320,
          250,
          38
        );
      }
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   SPORTS — BASKET SHOT
   ========================================================
  */

  function gameBasket() {
    let power = 0;
    let direction = 1;
    let score = 0;
    let shots = 0;

    function update(dt) {
      power +=
        direction *
        120 *
        dt;

      if (
        power > 100 ||
        power < 0
      ) {
        direction *= -1;
      }
    }

    document.addEventListener(
      "keydown",
      event => {
        if (
          !currentGame ||
          currentGame.type !== "basket"
        ) {
          return;
        }

        if (
          event.code === "Space"
        ) {
          shots++;

          if (
            power > 65 &&
            power < 90
          ) {
            score++;
          }
        }
      }
    );

    function draw() {
      resetCanvas();

      text(
        `Score: ${score}/${shots}`,
        20,
        30
      );

      text(
        "POWER",
        350,
        100
      );

      rect(
        300,
        130,
        200,
        30,
        "#17243a"
      );

      rect(
        300,
        130,
        power * 2,
        30
      );

      text(
        "Press SPACE to shoot",
        290,
        230,
        24
      );

      text(
        "🏀",
        380,
        400,
        55
      );
    }

    startLoop(update, draw);
  }

  /*
   ========================================================
   MOBILE CONTROLS
   ========================================================
  */

  document
    .querySelectorAll(
      "[data-control]"
    )
    .forEach(button => {

      const control =
        button.dataset.control;

      function press(event) {
        event.preventDefault();

        if (
          control === "left"
        ) {
          keys.add("arrowleft");
        }

        if (
          control === "right"
        ) {
          keys.add("arrowright");
        }

        if (
          control === "jump"
        ) {
          keys.add("arrowup");
          keys.add(" ");
        }

        if (
          control === "action"
        ) {
          keys.add(" ");
        }
      }

      function release(event) {
        event.preventDefault();

        if (
          control === "left"
        ) {
          keys.delete("arrowleft");
        }

        if (
          control === "right"
        ) {
          keys.delete("arrowright");
        }

        if (
          control === "jump"
        ) {
          keys.delete("arrowup");
          keys.delete(" ");
        }

        if (
          control === "action"
        ) {
          keys.delete(" ");
        }
      }

      button.addEventListener(
        "pointerdown",
        press
      );

      button.addEventListener(
        "pointerup",
        release
      );

      button.addEventListener(
        "pointercancel",
        release
      );

      button.addEventListener(
        "pointerleave",
        release
      );
    });

  /*
   ========================================================
   ACHIEVEMENT HOOKS
   ========================================================
  */

  window.addEventListener(
    "musabx:achievementUnlocked",
    event => {
      console.log(
        "Achievement unlocked:",
        event.detail
      );
    }
  );

  /*
   ========================================================
   INITIALIZE
   ========================================================
  */

  renderCategories();
  renderGames();

})();
```

