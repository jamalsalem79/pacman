const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const TILE_SIZE = 20;
const ROWS = 21;
const COLS = 21;

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

// 0: Empty, 1: Wall, 2: Dot, 3: Power Pellet
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,2,2,1],
    [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,3,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,3,1],
    [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let score = 0;
let powerMode = false;
let powerTimer = 0;

let pacman = {
    x: 10,
    y: 16,
    vx: 0,
    vy: 0,
    nextVx: 0,
    nextVy: 0,
    speed: 2, // pixels per frame, must be a factor of TILE_SIZE
    pixelX: 10 * TILE_SIZE,
    pixelY: 16 * TILE_SIZE,
    radius: TILE_SIZE / 2 - 2,
    angle: 0,
    mouthOpen: 0,
    mouthDir: 1
};

const ghosts = [
    { startX: 9, startY: 10, x: 9, y: 10, color: 'red', vx: 1, vy: 0, speed: 1.25, pixelX: 9 * TILE_SIZE, pixelY: 10 * TILE_SIZE, eaten: false },
    { startX: 10, startY: 10, x: 10, y: 10, color: 'pink', vx: -1, vy: 0, speed: 1.25, pixelX: 10 * TILE_SIZE, pixelY: 10 * TILE_SIZE, eaten: false },
    { startX: 11, startY: 10, x: 11, y: 10, color: 'cyan', vx: 0, vy: -1, speed: 1.25, pixelX: 11 * TILE_SIZE, pixelY: 10 * TILE_SIZE, eaten: false },
    { startX: 10, startY: 9, x: 10, y: 9, color: 'orange', vx: 0, vy: -1, speed: 1.25, pixelX: 10 * TILE_SIZE, pixelY: 9 * TILE_SIZE, eaten: false }
];

document.addEventListener('keydown', (e) => {
    // Prevent default scrolling for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { pacman.nextVx = 0; pacman.nextVy = -1; }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { pacman.nextVx = 0; pacman.nextVy = 1; }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { pacman.nextVx = -1; pacman.nextVy = 0; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { pacman.nextVx = 1; pacman.nextVy = 0; }
});

function drawMap() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 1) {
                ctx.fillStyle = '#1919A6';
                ctx.fillRect(c * TILE_SIZE + 1, r * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (map[r][c] === 2) {
                // Normal Dot
                ctx.fillStyle = '#FFB8AE';
                ctx.beginPath();
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (map[r][c] === 3) {
                // Power Pellet
                ctx.fillStyle = '#FFB8AE';
                ctx.beginPath();
                // Blinking effect logic simple using Date.now()
                const blink = Math.floor(Date.now() / 200) % 2 === 0;
                ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, blink ? 6 : 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

function updateEntity(entity, isPacman) {
    // Check if exactly on a logical tile step
    let onTileX = Math.abs((entity.pixelX % TILE_SIZE) - 0) < 0.1 || Math.abs((entity.pixelX % TILE_SIZE) - TILE_SIZE) < 0.1;
    let onTileY = Math.abs((entity.pixelY % TILE_SIZE) - 0) < 0.1 || Math.abs((entity.pixelY % TILE_SIZE) - TILE_SIZE) < 0.1;

    if (onTileX && onTileY) {
        // Snap perfectly to grid to avoid floating errors accumulate
        entity.pixelX = Math.round(entity.pixelX / TILE_SIZE) * TILE_SIZE;
        entity.pixelY = Math.round(entity.pixelY / TILE_SIZE) * TILE_SIZE;
        
        entity.x = entity.pixelX / TILE_SIZE;
        entity.y = entity.pixelY / TILE_SIZE;
        
        if (isPacman) {
            let nextX = entity.x + entity.nextVx;
            let nextY = entity.y + entity.nextVy;
            
            // Wrap around check for logic
            if (nextX < 0) nextX = COLS - 1;
            if (nextX >= COLS) nextX = 0;

            if (map[nextY] && map[nextY][nextX] !== 1) {
                entity.vx = entity.nextVx;
                entity.vy = entity.nextVy;
            }

            let currX = entity.x + entity.vx;
            let currY = entity.y + entity.vy;
            if (currX < 0) currX = COLS - 1;
            if (currX >= COLS) currX = 0;

            if (map[currY] && map[currY][currX] === 1) {
                entity.vx = 0;
                entity.vy = 0;
            }
        } else {
            // Ghost simple random AI
            const directions = [
                {vx: 0, vy: -1}, {vx: 0, vy: 1}, {vx: -1, vy: 0}, {vx: 1, vy: 0}
            ];
            
            const validDirections = directions.filter(dir => {
                // Prevent ghost 180 turnaround unless stuck
                if (dir.vx === -entity.vx && dir.vy === -entity.vy && (entity.vx !== 0 || entity.vy !== 0)) return false; 
                
                let nx = entity.x + dir.vx;
                let ny = entity.y + dir.vy;
                
                if (nx < 0) nx = COLS - 1;
                if (nx >= COLS) nx = 0;
                
                return map[ny] && map[ny][nx] !== 1;
            });

            if (validDirections.length > 0) {
                const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
                entity.vx = randomDir.vx;
                entity.vy = randomDir.vy;
            } else {
                entity.vx *= -1;
                entity.vy *= -1;
            }
        }
    }

    if (!entity.eaten) {
        // Only move if not eaten (eaten ghosts stay at base in this simple version)
        let currentSpeed = entity.speed;
        
        // Slow down ghosts when power mode is active
        if (!isPacman && powerMode) {
            currentSpeed = entity.speed * 0.5;
        }

        entity.pixelX += entity.vx * currentSpeed;
        entity.pixelY += entity.vy * currentSpeed;
    }

    // Wrap around visually
    if (entity.pixelX < -TILE_SIZE) entity.pixelX = canvas.width;
    if (entity.pixelX > canvas.width) entity.pixelX = -TILE_SIZE;
}

function updatePacman() {
    updateEntity(pacman, true);

    let gridX = Math.round(pacman.pixelX / TILE_SIZE);
    let gridY = Math.round(pacman.pixelY / TILE_SIZE);
    
    if (gridX < 0) gridX = COLS - 1;
    if (gridX >= COLS) gridX = 0;

    if (map[gridY] && map[gridY][gridX] === 2) {
        map[gridY][gridX] = 0;
        score += 10;
        scoreElement.innerText = score;
    } else if (map[gridY] && map[gridY][gridX] === 3) {
        map[gridY][gridX] = 0;
        score += 50;
        scoreElement.innerText = score;
        
        // Activate power mode
        powerMode = true;
        powerTimer = 600; // ~10 seconds at 60fps
        
        // Reverse ghost direction when power pellet is eaten
        ghosts.forEach(ghost => {
            if (!ghost.eaten) {
                ghost.vx *= -1;
                ghost.vy *= -1;
                
                // Snap to pixel grid instantly if reversing
                ghost.pixelX = Math.round(ghost.pixelX / (TILE_SIZE * 0.25)) * (TILE_SIZE * 0.25);
                ghost.pixelY = Math.round(ghost.pixelY / (TILE_SIZE * 0.25)) * (TILE_SIZE * 0.25);
            }
        });
    }

    // Power mode timer logic
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) {
            powerMode = false;
            // Respawn any eaten ghosts to standard mode
            ghosts.forEach(ghost => ghost.eaten = false);
        }
    }

    // Set angle for drawing
    if (pacman.vx === 1) pacman.angle = 0;
    else if (pacman.vx === -1) pacman.angle = Math.PI;
    else if (pacman.vy === 1) pacman.angle = Math.PI / 2;
    else if (pacman.vy === -1) pacman.angle = -Math.PI / 2;

    // Animate mouth
    if (pacman.vx !== 0 || pacman.vy !== 0) {
        pacman.mouthOpen += 0.05 * pacman.mouthDir;
        if (pacman.mouthOpen >= 0.5 || pacman.mouthOpen <= 0) {
            pacman.mouthDir *= -1;
        }
    }
}

let isGameOver = false;

function updateGhosts() {
    ghosts.forEach(ghost => {
        updateEntity(ghost, false);
        
        // Check collision (distance check)
        const dist = Math.hypot(pacman.pixelX - ghost.pixelX, pacman.pixelY - ghost.pixelY);
        if (dist < TILE_SIZE * 0.8) {
            if (powerMode && !ghost.eaten) {
                // Pac-Man eats Ghost
                score += 200;
                scoreElement.innerText = score;
                ghost.eaten = true;
                
                // Return ghost to start position
                ghost.pixelX = ghost.startX * TILE_SIZE;
                ghost.pixelY = ghost.startY * TILE_SIZE;
                ghost.x = ghost.startX;
                ghost.y = ghost.startY;
            } else if (!ghost.eaten) {
                // Ghost eats Pac-Man
                isGameOver = true;
                setTimeout(() => {
                    alert('Game Over! Your Score: ' + score);
                    document.location.reload();
                }, 50);
            }
        }
    });
}

function drawPacman() {
    ctx.save();
    ctx.translate(pacman.pixelX + TILE_SIZE / 2, pacman.pixelY + TILE_SIZE / 2);
    ctx.rotate(pacman.angle);
    
    ctx.fillStyle = '#FFE800';
    ctx.beginPath();
    ctx.arc(0, 0, pacman.radius, pacman.mouthOpen * Math.PI, (2 - pacman.mouthOpen) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        const startX = ghost.pixelX + TILE_SIZE / 2;
        const startY = ghost.pixelY + TILE_SIZE / 2;
        
        if (ghost.eaten) {
            // Draw only floating eyes if eaten
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(startX - pacman.radius * 0.4, startY - pacman.radius * 0.2, 2.5, 0, Math.PI * 2);
            ctx.arc(startX + pacman.radius * 0.4, startY - pacman.radius * 0.2, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            let eyeOffsetX = (ghost.vx > 0 ? 1 : (ghost.vx < 0 ? -1 : 0));
            let eyeOffsetY = (ghost.vy > 0 ? 1 : (ghost.vy < 0 ? -1 : 0));
            ctx.arc(startX - pacman.radius * 0.4 + eyeOffsetX, startY - pacman.radius * 0.2 + eyeOffsetY, 1, 0, Math.PI * 2);
            ctx.arc(startX + pacman.radius * 0.4 + eyeOffsetX, startY - pacman.radius * 0.2 + eyeOffsetY, 1, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        // Normal or vulnerable ghost body
        if (powerMode) {
             // Blinking white and blue dynamically as timer runs out
            if (powerTimer < 150 && powerTimer % 20 < 10) {
                ctx.fillStyle = 'white';
            } else {
                ctx.fillStyle = '#2121E4'; // Blueish vulnerable color
            }
        } else {
            ctx.fillStyle = ghost.color;
        }

        ctx.beginPath();
        
        ctx.arc(startX, startY, pacman.radius, Math.PI, 0);
        ctx.lineTo(startX + pacman.radius, startY + pacman.radius);
        
        // Wavy bottom skirt for ghosts
        ctx.lineTo(startX + pacman.radius * 0.5, startY + pacman.radius * 0.5);
        ctx.lineTo(startX, startY + pacman.radius);
        ctx.lineTo(startX - pacman.radius * 0.5, startY + pacman.radius * 0.5);
        
        ctx.lineTo(startX - pacman.radius, startY + pacman.radius);
        ctx.fill();
        
        // White of the eyes
        ctx.fillStyle = powerMode ? '#FFB8AE' : 'white';
        ctx.beginPath();
        ctx.arc(startX - pacman.radius * 0.4, startY - pacman.radius * 0.2, 2.5, 0, Math.PI * 2);
        ctx.arc(startX + pacman.radius * 0.4, startY - pacman.radius * 0.2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils looking at direction of travel
        ctx.fillStyle = powerMode ? 'red' : 'blue';
        ctx.beginPath();
        let eyeOffsetX = (ghost.vx > 0 ? 1 : (ghost.vx < 0 ? -1 : 0));
        let eyeOffsetY = (ghost.vy > 0 ? 1 : (ghost.vy < 0 ? -1 : 0));
        ctx.arc(startX - pacman.radius * 0.4 + eyeOffsetX, startY - pacman.radius * 0.2 + eyeOffsetY, 1, 0, Math.PI * 2);
        ctx.arc(startX + pacman.radius * 0.4 + eyeOffsetX, startY - pacman.radius * 0.2 + eyeOffsetY, 1, 0, Math.PI * 2);
        ctx.fill();
    });
}

function spawnDotCheck() {
    let dotsLeft = false;
    for(let r=0; r<ROWS; r++){
        for(let c=0; c<COLS; c++){
            if(map[r][c] === 2 || map[r][c] === 3) {
                dotsLeft = true;
                break;
            }
        }
        if (dotsLeft) break;
    }
    
    if(!dotsLeft) {
        isGameOver = true;
        setTimeout(() => {
            alert('You Win! Your Final Score: ' + score);
            document.location.reload();
        }, 50);
    }
}

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawMap();
    updatePacman();
    drawPacman();
    
    updateGhosts();
    drawGhosts();
    
    spawnDotCheck();
    
    requestAnimationFrame(gameLoop);
}

// Ensure fonts and initial render wait just slightly if needed, but requestAnimationFrame is fine
requestAnimationFrame(gameLoop);
