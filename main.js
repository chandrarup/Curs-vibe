// Initialize Kaboom
kaboom({
    canvas: document.getElementById("game"),
    background: [135, 206, 235],
    width: 800,
    height: 600,
    scale: 1,
    debug: true,
    global: true,
});

// Constants for player movement
const PLAYER_SPEED = 320;
const JUMP_FORCE = 800;
const ENEMY_SPEED = 150;
const SCROLL_SPEED = 280;

// Level layout
const TILE_SIZE = 32;
const levelLayout = [
    "                              ",
    "        $$   $$              ",
    "     ====    ====   ===      ",
    "                             ",
    "           @                 ",
    "    %            %          ",
    "============================="
];

// Game scene
scene("main", () => {
    // Add gravity to the game
    setGravity(2000);

    // Initialize score
    let score = 0;
    
    // Add score display
    const scoreText = add([
        text("Score: " + score, { size: 24 }),
        pos(24, 24),
        fixed(),
        { value: 0 }
    ]);

    // Create the ground
    const ground = add([
        rect(width() * 2, 48),
        pos(0, height() - 48),
        color(0, 255, 0),
        area(),
        body({ isStatic: true }),
        "ground"
    ]);

    // Create the player
    const player = add([
        rect(32, 32),
        pos(120, height() - 200),
        color(255, 0, 0),
        area(),
        body(),
        {
            speed: SCROLL_SPEED
        }
    ]);

    // Function to spawn a coin
    function spawnCoin() {
        const x = player.pos.x + width();
        const y = rand(height() - 300, height() - 100);
        
        add([
            circle(16),
            pos(x, y),
            color(255, 255, 0),
            area(),
            "coin",
            {
                passed: false
            }
        ]);

        wait(rand(0.5, 2), spawnCoin);
    }

    // Function to spawn an enemy
    function spawnEnemy() {
        const x = player.pos.x + width();
        const y = height() - 80;
        
        add([
            rect(32, 32),
            pos(x, y),
            color(0, 0, 255),
            area(),
            "enemy",
            {
                passed: false
            }
        ]);

        wait(rand(1, 3), spawnEnemy);
    }

    // Start spawning
    spawnCoin();
    spawnEnemy();

    // Handle coin collection
    player.onCollide("coin", (coin) => {
        destroy(coin);
        score++;
        scoreText.text = "Score: " + score;
    });

    // Handle enemy collisions
    player.onCollide("enemy", (enemy) => {
        if (player.pos.y < enemy.pos.y - 20) {
            destroy(enemy);
            player.jump(400);
            score += 2;
            scoreText.text = "Score: " + score;
        } else {
            go("gameOver", score);
        }
    });

    // Jump controls
    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
        }
    });

    onKeyPress("up", () => {
        if (player.isGrounded()) {
            player.jump(JUMP_FORCE);
        }
    });

    // Camera follows player
    onUpdate(() => {
        // Move player forward automatically
        player.move(SCROLL_SPEED, 0);
        
        // Update camera position to follow player
        camPos(player.pos.x, camPos().y);

        // Create new ground segments as needed
        if (player.pos.x > ground.pos.x + width()) {
            ground.pos.x += width();
        }

        // Clean up objects that are far behind
        get("coin").forEach((coin) => {
            if (coin.pos.x < player.pos.x - width()) {
                destroy(coin);
            }
        });
        
        get("enemy").forEach((enemy) => {
            if (enemy.pos.x < player.pos.x - width()) {
                destroy(enemy);
            }
        });

        // Game over if fallen
        if (player.pos.y > height()) {
            go("gameOver", score);
        }
    });
});

// Game over scene
scene("gameOver", (finalScore) => {
    add([
        text("Game Over!\nScore: " + finalScore + "\nPress space to restart", { size: 24 }),
        pos(center()),
        anchor("center")
    ]);

    onKeyPress("space", () => {
        go("main");
    });
});

// Start with the main scene
go("main"); 