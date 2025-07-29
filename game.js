document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO MENU ---
    const mainMenu = document.getElementById('mainMenu');
    const characterSelectMenu = document.getElementById('characterSelectMenu');
    const levelSelectMenu = document.getElementById('levelSelectMenu');
    const startGameBtn = document.getElementById('startGameBtn');
    const selectCharacterBtn = document.getElementById('selectCharacterBtn');
    const selectLevelBtn = document.getElementById('selectLevelBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const backToMenuFromLevelSelectBtn = document.getElementById('backToMenuFromLevelSelectBtn');
    const characterOptions = document.querySelectorAll('.character-option');
    const levelSelectButtons = document.querySelectorAll('.level-select-btn');
    const difficultyDisplay = document.getElementById('difficultyDisplay');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- CONFIGURAÇÕES GLOBAIS ---
    let gameState = 'menu'; // menu, playing, in_boss_room, gameOver, victory
    let currentLevel = 1;
    let score = 0;
    let gameDifficulty = 1;
    const gravity = 0.6;
    let levelStartTimer = 0;

    // --- GERENCIAMENTO DE RECURSOS ---
    const playerSprite = new Image();
    const enemySprite = new Image();
    const boss1Sprite = new Image();
    const boss2Sprite = new Image();
    const boss3Sprite = new Image();
    const bgSky = new Image();
    const bgHillsFar = new Image();
    const bgHillsNear = new Image();
    const bgVertical = new Image();
    const bgLavaSky = new Image();
    const bgVolcano = new Image();
    const grassDirtTexture = new Image();
    const bushSprite = new Image();
    const rockSprite = new Image();
    const castleWallTexture = new Image();
    const castleBricksTexture = new Image();
    const torchSprite = new Image();

    let selectedCharacterSrc = 'characters/arlan.jpg';
    playerSprite.src = selectedCharacterSrc;
    enemySprite.src = 'characters/bowser.png';
    boss1Sprite.src = 'characters/bowser.png';
    boss2Sprite.src = 'characters/davi.jpg';
    boss3Sprite.src = 'characters/brian.jpg';
    bgSky.src = 'assets/sky.jpg';
    castleBricksTexture.src = 'assets/castelo2.png';
    castleWallTexture.src = 'assets/castelo2.png';
    grassDirtTexture.src = 'assets/cenario1.jpg';
    bgHillsFar.src = 'assets/cenario2.jpg';
    bgHillsNear.src = 'assets/cenario3.jpeg';
    bgVertical.src = 'assets/vertical_bg.png';
    bgLavaSky.src = 'assets/lava_sky.png';
    bgVolcano.src = 'assets/volcano.png';
    bushSprite.src = 'assets/bush.png';
    rockSprite.src = 'assets/rock.png';
    torchSprite.src = 'assets/torch.gif';

    let grassDirtPattern, castleBricksPattern, castleWallPattern;

    const levels = {
        1: {
            type: 'horizontal', worldWidth: 2400,
            background: [ { img: bgSky, scrollFactor: 0.1 }, { img: bgHillsFar, scrollFactor: 0.3 }, { img: bgHillsNear, scrollFactor: 0.6 } ],
            decorations: [ { img: bushSprite, x: 250, y: 380, w: 60, h: 40 }, { img: rockSprite, x: 500, y: 390, w: 40, h: 30 }, { img: bushSprite, x: 950, y: 380, w: 60, h: 40 }, { img: bushSprite, x: 1700, y: 380, w: 60, h: 40 } ],
            platforms: [ { x: 0, y: 420, width: 800, height: 30 }, { x: 850, y: 420, width: 600, height: 30 }, { x: 1500, y: 420, width: 700, height: 30 }, { x: 200, y: 320, width: 150, height: 20 }, { x: 400, y: 250, width: 150, height: 20 }, { x: 600, y: 180, width: 100, height: 20 }, { x: 900, y: 300, width: 200, height: 20 }, { x: 1200, y: 220, width: 150, height: 20 }, { x: 1600, y: 300, width: 100, height: 20 }, { x: 1750, y: 240, width: 100, height: 20 }, { x: 1900, y: 180, width: 100, height: 20 }, { x: 2100, y: 350, width: 100, height: 20 } ],
            // NEW: Added moving platforms
            movingPlatforms: [ { x: 400, y: 380, width: 120, height: 20, startX: 400, endX: 700, speed: 1, dir: 1, isMoving: true } ],
            coins: [ { x: 250, y: 280, w: 20, h: 20, collected: false }, { x: 450, y: 210, w: 20, h: 20, collected: false }, { x: 950, y: 260, w: 20, h: 20, collected: false }, { x: 1250, y: 180, w: 20, h: 20, collected: false }, { x: 1800, y: 200, w: 20, h: 20, collected: false } ],
            enemies: [ { type: 'ground', x: 300, y: 382, w: 40, h: 38, speed: 1, dir: 1 }, { type: 'ground', x: 1000, y: 382, w: 40, h: 38, speed: 1.5, dir: -1 }, { type: 'piranha', x: 1625, y: 300, w: 40, h: 40 }, { type: 'ground', x: 1750, y: 382, w: 40, h: 38, speed: 0.8, dir: 1 } ],
            door: { x: 2300, y: 320, width: 80, height: 100 },
            bossRoom: {
                background: [ { img: castleWallTexture, scrollFactor: 0.5 } ],
                decorations: [ { img: torchSprite, x: 50, y: 250, w: 40, h: 80 }, { img: torchSprite, x: 710, y: 250, w: 40, h: 80 } ],
                platforms: [{ x: 0, y: 420, width: canvas.width, height: 30 }],
                boss: { x: 650, y: 320, width: 100, height: 100, health: 10, speed: 2, attackMode: 'single', img: boss1Sprite }
            }
        },
        2: {
            type: 'vertical', worldHeight: 1200,
            background: [ { img: bgVertical, scrollFactor: 0.1 }],
            decorations: [],
            platforms: [ { x: 0, y: 1150, width: canvas.width, height: 50 }, { x: 600, y: 1050, width: 200, height: 20 }, { x: 400, y: 950, width: 150, height: 20 }, { x: 200, y: 850, width: 150, height: 20 }, { x: 50, y: 750, width: 100, height: 20 }, { x: 250, y: 650, width: 200, height: 20 }, { x: 500, y: 550, width: 150, height: 20 }, { x: 650, y: 450, width: 100, height: 20 }, { x: 450, y: 350, width: 150, height: 20 }, { x: 250, y: 250, width: 100, height: 20 }, { x: 0, y: 120, width: canvas.width, height: 20 } ],
            movingPlatforms: [],
            coins: [ { x: 650, y: 1010, w: 20, h: 20, collected: false }, { x: 250, y: 810, w: 20, h: 20, collected: false }, { x: 300, y: 610, w: 20, h: 20, collected: false }, { x: 700, y: 410, w: 20, h: 20, collected: false }, { x: 300, y: 210, w: 20, h: 20, collected: false } ],
            enemies: [ { type: 'ground', x: 100, y: 1112, w: 40, h: 38, speed: 1.5, dir: 1 }, { type: 'flying', x: 100, y: 600, w: 40, h: 38, speed: 1, range: 100 }, { type: 'flying', x: 700, y: 800, w: 40, h: 38, speed: 1, range: 100 } ],
            door: { x: canvas.width / 2 - 40, y: 20, width: 80, height: 100 },
            bossRoom: {
                background: [ { img: castleWallTexture, scrollFactor: 0.5 } ],
                decorations: [ { img: torchSprite, x: 50, y: 250, w: 40, h: 80 }, { img: torchSprite, x: 710, y: 250, w: 40, h: 80 } ],
                platforms: [{ x: 0, y: 420, width: canvas.width, height: 30 }],
                boss: { x: canvas.width / 2 - 50, y: 320, width: 100, height: 100, health: 15, speed: 1, attackMode: 'volley', img: boss2Sprite }
            }
        },
        3: {
            type: 'horizontal', worldWidth: 3200,
            background: [ { img: bgLavaSky, scrollFactor: 0.2 }, { img: bgVolcano, scrollFactor: 0.5 } ],
            decorations: [ { img: bushSprite, x: 250, y: 380, w: 60, h: 40 }, { img: rockSprite, x: 1200, y: 390, w: 40, h: 30 }, { img: bushSprite, x: 2300, y: 380, w: 60, h: 40 } ],
            platforms: [ { x: 0, y: 420, width: 400, height: 30 }, { x: 500, y: 350, width: 150, height: 20 }, { x: 700, y: 300, width: 150, height: 20 }, { x: 900, y: 420, width: 500, height: 30 }, { x: 1100, y: 320, width: 100, height: 20 }, { x: 1500, y: 420, width: 600, height: 30 }, { x: 1700, y: 300, width: 20, height: 120 }, { x: 1800, y: 250, width: 150, height: 20 }, { x: 2200, y: 420, width: 800, height: 30 }, { x: 2400, y: 320, width: 150, height: 20 }, { x: 2600, y: 250, width: 100, height: 20 }, { x: 2800, y: 180, width: 150, height: 20 } ],
            movingPlatforms: [ { x: 1000, y: 250, width: 150, height: 20, startX: 950, endX: 1350, speed: 1.5, dir: 1, isMoving: true } ],
            coins: [ { x: 550, y: 310, w: 20, h: 20, collected: false }, { x: 1125, y: 280, w: 20, h: 20, collected: false }, { x: 1850, y: 210, w: 20, h: 20, collected: false }, { x: 2450, y: 280, w: 20, h: 20, collected: false }, { x: 2850, y: 140, w: 20, h: 20, collected: false } ],
            enemies: [ { type: 'ground', x: 250, y: 382, w: 40, h: 38, speed: 1, dir: 1 }, { type: 'ghost', x: 800, y: 300, w: 40, h: 40, speed: 1.5 }, { type: 'ground', x: 950, y: 382, w: 40, h: 38, speed: 2, dir: 1 }, { type: 'ground', x: 1300, y: 382, w: 40, h: 38, speed: 2, dir: -1 }, { type: 'ghost', x: 1600, y: 200, w: 40, h: 40, speed: 1.5 }, { type: 'ground', x: 1950, y: 382, w: 40, h: 38, speed: 1.2, dir: -1 }, { type: 'piranha', x: 2450, y: 320, w: 40, h: 40 }, { type: 'ground', x: 2650, y: 382, w: 40, h: 38, speed: 1.5, dir: -1 } ],
            door: { x: 3100, y: 320, width: 80, height: 100 },
            bossRoom: {
                background: [ { img: castleWallTexture, scrollFactor: 0.5 } ],
                decorations: [ { img: torchSprite, x: 50, y: 250, w: 40, h: 80 }, { img: torchSprite, x: 710, y: 250, w: 40, h: 80 } ],
                platforms: [{ x: 0, y: 420, width: 150, height: 30 }, {x: 200, y: 350, width: 400, height: 20}, { x: 650, y: 420, width: 150, height: 30 }],
                boss: { x: 700, y: 320, width: 100, height: 100, health: 20, speed: 3, attackMode: 'both', img: boss3Sprite }
            }
        }
    };
    
    let assetsLoaded = 0;
    const totalAssets = 17; 
    function onAssetLoad() {
        if (++assetsLoaded === totalAssets) {
            grassDirtPattern = ctx.createPattern(grassDirtTexture, 'repeat');
            castleBricksPattern = ctx.createPattern(castleBricksTexture, 'repeat');
            castleWallPattern = ctx.createPattern(castleWallTexture, 'repeat');
        }
    }
    playerSprite.onload = onAssetLoad; playerSprite.onerror = onAssetLoad;
    enemySprite.onload = onAssetLoad; enemySprite.onerror = onAssetLoad;
    boss1Sprite.onload = onAssetLoad; boss1Sprite.onerror = onAssetLoad;
    boss2Sprite.onload = onAssetLoad; boss2Sprite.onerror = onAssetLoad;
    boss3Sprite.onload = onAssetLoad; boss3Sprite.onerror = onAssetLoad;
    bgSky.onload = onAssetLoad; bgSky.onerror = onAssetLoad;
    bgHillsFar.onload = onAssetLoad; bgHillsFar.onerror = onAssetLoad;
    bgHillsNear.onload = onAssetLoad; bgHillsNear.onerror = onAssetLoad;
    bgVertical.onload = onAssetLoad; bgVertical.onerror = onAssetLoad;
    bgLavaSky.onload = onAssetLoad; bgLavaSky.onerror = onAssetLoad;
    bgVolcano.onload = onAssetLoad; bgVolcano.onerror = onAssetLoad;
    grassDirtTexture.onload = onAssetLoad; grassDirtTexture.onerror = onAssetLoad;
    bushSprite.onload = onAssetLoad; bushSprite.onerror = onAssetLoad;
    rockSprite.onload = onAssetLoad; rockSprite.onerror = onAssetLoad;
    castleWallTexture.onload = onAssetLoad; castleWallTexture.onerror = onAssetLoad;
    castleBricksTexture.onload = onAssetLoad; castleBricksTexture.onerror = onAssetLoad;
    torchSprite.onload = onAssetLoad; torchSprite.onerror = onAssetLoad;

    // UPDATED: Added canDoubleJump property to the player
    const player = { x: 100, y: 350, width: 40, height: 50, speed: 5, dx: 0, dy: 0, isJumping: false, grounded: false, canDoubleJump: false, facing: 'right', draw() { /*...*/ } };
    let platforms = [], movingPlatforms = [], coins = [], enemies = [], boss = null, bossProjectiles = [], particles = [];
    const camera = { x: 0, y: 0, width: canvas.width, height: canvas.height, update() { /*...*/ } };
    const keys = { right: { pressed: false }, left: { pressed: false } };

    function saveDifficulty() { localStorage.setItem('gameDifficulty', gameDifficulty); }
    function loadDifficulty() { gameDifficulty = parseInt(localStorage.getItem('gameDifficulty')) || 1; }

    function showMainMenu() { difficultyDisplay.textContent = `Dificuldade: ${gameDifficulty}`; mainMenu.classList.remove('hidden'); characterSelectMenu.classList.add('hidden'); levelSelectMenu.classList.add('hidden'); gameState = 'menu'; }
    function showCharacterSelect() { mainMenu.classList.add('hidden'); characterSelectMenu.classList.remove('hidden'); gameState = 'characterSelect'; characterOptions.forEach(opt => { opt.classList.toggle('selected', opt.dataset.char === selectedCharacterSrc); }); }
    function showLevelSelect() { mainMenu.classList.add('hidden'); levelSelectMenu.classList.remove('hidden'); }
    function startNewGame() { score = 0; currentLevel = 1; startGameFlow(); }
    function startSpecificLevel(level) { score = 0; currentLevel = level; startGameFlow(); }

    function startGameFlow() {
        mainMenu.classList.add('hidden');
        characterSelectMenu.classList.add('hidden');
        levelSelectMenu.classList.add('hidden');
        playerSprite.src = selectedCharacterSrc;
        if (playerSprite.complete) { initLevel(currentLevel); }
        else { playerSprite.onload = () => { initLevel(currentLevel); }; }
    }

    startGameBtn.addEventListener('click', startNewGame);
    selectCharacterBtn.addEventListener('click', showCharacterSelect);
    selectLevelBtn.addEventListener('click', showLevelSelect);
    backToMenuBtn.addEventListener('click', showMainMenu);
    backToMenuFromLevelSelectBtn.addEventListener('click', showMainMenu);
    characterOptions.forEach(option => { option.addEventListener('click', () => { selectedCharacterSrc = option.dataset.char; characterOptions.forEach(opt => opt.classList.remove('selected')); option.classList.add('selected'); showMainMenu(); }); });
    levelSelectButtons.forEach(button => { button.addEventListener('click', (e) => { const level = parseInt(e.target.dataset.level); startSpecificLevel(level); }); });

    function initLevel(levelNumber) {
        const levelData = levels[levelNumber];
        if (!levelData) return;
        player.dx = 0; player.dy = 0; player.facing = 'right';
        particles = []; bossProjectiles = []; boss = null;
        platforms = JSON.parse(JSON.stringify(levelData.platforms));
        // NEW: Initialize moving platforms
        movingPlatforms = levelData.movingPlatforms ? JSON.parse(JSON.stringify(levelData.movingPlatforms)) : [];
        coins = JSON.parse(JSON.stringify(levelData.coins));

        const difficultySpeedMultiplier = 1 + (gameDifficulty - 1) * 0.2;
        enemies = JSON.parse(JSON.stringify(levelData.enemies)).map(e => {
            const base = { ...e, dy: 0, grounded: false }; base.speed *= difficultySpeedMultiplier;
            switch(e.type) {
                case 'piranha': base.state = 'hiding'; base.timer = Math.random() * 120 + 60; base.initialY = e.y; break;
                case 'flying': base.initialY = e.y; base.dir = 1; break;
                case 'ghost': break;
                default: break;
            }
            return base;
        });

        if (levelData.type === 'vertical') { player.x = canvas.width / 2; player.y = 1100; }
        else { player.x = 100; player.y = 350; }
        
        camera.update();
        gameState = 'playing';
        levelStartTimer = 120;
    }
    
    function enterBossRoom() {
        const levelData = levels[currentLevel];
        if (!levelData || !levelData.bossRoom) return;

        gameState = 'in_boss_room';
        platforms = JSON.parse(JSON.stringify(levelData.bossRoom.platforms));
        movingPlatforms = []; // No moving platforms in boss rooms for now
        enemies = [];
        coins = [];

        player.x = 100;
        player.y = 300;
        player.dx = 0;

        const bossData = levelData.bossRoom.boss;
        const difficultyHealthMultiplier = 1 + (gameDifficulty - 1) * 0.5;
        const difficultySpeedMultiplier = 1 + (gameDifficulty - 1) * 0.2;
        boss = { ...bossData,
            maxHealth: Math.round(bossData.health * difficultyHealthMultiplier),
            health: Math.round(bossData.health * difficultyHealthMultiplier),
            speed: bossData.speed * difficultySpeedMultiplier,
            direction: 1, attackTimer: 120, invincibleTimer: 0,
            modeSwitchTimer: 300
        };
        
        camera.update();
        levelStartTimer = 120;
    }

    function goToNextLevel() { boss = null; currentLevel++; if (levels[currentLevel]) { initLevel(currentLevel); } else { gameDifficulty++; saveDifficulty(); gameState = 'victory'; } }
    // UPDATED: Added updateMovingPlatforms call
    function update() { if (gameState !== 'playing' && gameState !== 'in_boss_room' || levelStartTimer > 0) return; updatePlayer(); updateMovingPlatforms(); if (gameState === 'playing') { updateEnemies(); } if (gameState === 'in_boss_room' && boss) { updateBoss(); updateProjectiles(); } updateParticles(); checkCollisions(); camera.update(); }
    player.draw = function() { ctx.save(); const imageToDraw = playerSprite; if (this.facing === 'left') { ctx.scale(-1, 1); if (imageToDraw.complete && imageToDraw.naturalHeight !== 0) ctx.drawImage(imageToDraw, -this.x - this.width, this.y, this.width, this.height); else { ctx.fillStyle = '#FF5733'; ctx.fillRect(-this.x - this.width, this.y, this.width, this.height); } } else { if (imageToDraw.complete && imageToDraw.naturalHeight !== 0) ctx.drawImage(imageToDraw, this.x, this.y, this.width, this.height); else { ctx.fillStyle = '#FF5733'; ctx.fillRect(this.x, this.y, this.width, this.height); } } ctx.restore(); }
    camera.update = function() { if (gameState === 'in_boss_room') { this.x = 0; this.y = 0; return; } const levelData = levels[currentLevel]; if (!levelData) return; if (levelData.type === 'horizontal') { this.x = player.x - this.width / 2 + player.width / 2; if (this.x < 0) this.x = 0; if (this.x + this.width > levelData.worldWidth) this.x = levelData.worldWidth - this.width; this.y = 0; } else if (levelData.type === 'vertical') { this.y = player.y - this.height / 2 + player.height / 2; if (this.y < 0) this.y = 0; if (this.y + this.height > levelData.worldHeight) this.y = levelData.worldHeight - this.height; this.x = 0; } else { this.x = 0; this.y = 0; } };
    
    // UPDATED: Complete rewrite of the player update function for better physics
    function updatePlayer() {
        const levelData = levels[currentLevel];
        if (!levelData) return;
    
        // 1. HORIZONTAL MOVEMENT
        if (keys.right.pressed) {
            player.dx = player.speed;
            player.facing = 'right';
        } else if (keys.left.pressed) {
            player.dx = -player.speed;
            player.facing = 'left';
        } else {
            player.dx = 0;
        }
    
        // 2. VERTICAL MOVEMENT (GRAVITY)
        player.dy += gravity;
    
        // Temporarily move the player to check collisions
        player.x += player.dx;
    
        // 3. HORIZONTAL COLLISION
        const allPlatforms = [...platforms, ...movingPlatforms]; // Combine all platforms for collision checks
        allPlatforms.forEach(p => {
            if (
                player.y + player.height > p.y &&
                player.y < p.y + p.height &&
                player.x + player.width > p.x &&
                player.x < p.x + p.width
            ) {
                // Horizontal collision
                if (player.dx > 0) { // moving right
                    player.x = p.x - player.width;
                } else if (player.dx < 0) { // moving left
                    player.x = p.x + p.width;
                }
            }
        });
    
        // Now apply vertical movement
        player.y += player.dy;
        player.grounded = false;
    
        // 4. VERTICAL COLLISION (JUMP-THROUGH LOGIC)
        allPlatforms.forEach(p => {
            if (
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y &&
                player.y < p.y + p.height
            ) {
                // Check if landing on top of a platform (jump-through logic)
                if (player.dy > 0 && (player.y + player.height - player.dy) <= p.y) {
                    player.y = p.y - player.height;
                    player.dy = 0;
                    player.isJumping = false;
                    player.grounded = true;
                    player.canDoubleJump = true; // Reset double jump on any landing
    
                    // If it's a moving platform, make the player move with it
                    if (p.isMoving) {
                        player.x += p.speed * p.dir;
                    }
                }
                // Removed the "bonk head" logic, so no "else if (player.dy < 0)" is needed
            }
        });
    
        // 5. WORLD BOUNDARIES & FALLING
        const worldLimitX = (gameState === 'in_boss_room') ? canvas.width : (levelData.type === 'horizontal' ? levelData.worldWidth : canvas.width);
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > worldLimitX) player.x = worldLimitX - player.width;
    
        const fallBoundary = levelData.type === 'vertical' ? levelData.worldHeight + player.height : canvas.height * 2;
        if (player.y > fallBoundary) {
            gameState = 'gameOver';
        }
    }
    
    // NEW: Function to update moving platforms
    function updateMovingPlatforms() {
        movingPlatforms.forEach(p => {
            p.x += p.speed * p.dir;
            if (p.dir === 1 && p.x + p.width >= p.endX) {
                p.dir = -1;
            } else if (p.dir === -1 && p.x <= p.startX) {
                p.dir = 1;
            }
        });
    }

    function updateEnemies() { const allPlatforms = [...platforms, ...movingPlatforms]; enemies.forEach(enemy => { switch(enemy.type) { case 'ground': if (!enemy.grounded) { enemy.dy += gravity; enemy.y += enemy.dy; } enemy.grounded = false; let onAPlatform = false; allPlatforms.forEach(p => { if (enemy.x < p.x + p.width && enemy.x + enemy.w > p.x && enemy.y + enemy.h >= p.y && enemy.y + enemy.h <= p.y + p.height + 1) { enemy.dy = 0; enemy.grounded = true; onAPlatform = true; enemy.y = p.y - enemy.h; } }); if (enemy.grounded) { enemy.x += enemy.speed * enemy.dir; const platformUnder = allPlatforms.find(p => enemy.y + enemy.h === p.y && enemy.x + enemy.w >= p.x && enemy.x <= p.x + p.width); if (platformUnder) { if ((enemy.dir === 1 && enemy.x + enemy.w > platformUnder.x + platformUnder.width) || (enemy.dir === -1 && enemy.x < platformUnder.x)) { enemy.dir *= -1; } } else if (onAPlatform) { enemy.dir *= -1; } } break; case 'piranha': enemy.timer--; if (enemy.timer <= 0) { enemy.state = (enemy.state === 'hiding') ? 'attacking' : 'hiding'; enemy.timer = (enemy.state === 'hiding') ? 180 : 120; } if (enemy.state === 'attacking') { enemy.y = Math.max(enemy.y - 2, enemy.initialY - enemy.h); } else { enemy.y = Math.min(enemy.y + 2, enemy.initialY); } break; case 'ghost': const dx = player.x - enemy.x; const dy = player.y - enemy.y; const isFacingAway = (player.facing === 'right' && dx < 0) || (player.facing === 'left' && dx > 0); if (isFacingAway) { const distance = Math.sqrt(dx * dx + dy * dy); if (distance > 1) { enemy.x += (dx / distance) * enemy.speed * 0.5; enemy.y += (dy / distance) * enemy.speed * 0.5; } } break; case 'flying': enemy.y += enemy.speed * enemy.dir; if (enemy.y < enemy.initialY - enemy.range || enemy.y > enemy.initialY) { enemy.dir *= -1; } break; } }); }
    function updateBoss() { if (boss.invincibleTimer > 0) boss.invincibleTimer--; boss.x += boss.speed * boss.direction; if (boss.x < 0 || boss.x + boss.width > canvas.width) { boss.direction *= -1; } boss.modeSwitchTimer--; if (boss.modeSwitchTimer <= 0) { const modes = ['single', 'volley']; if (boss.attackMode === 'both') { boss.attackMode = modes[Math.floor(Math.random()*modes.length)]; } else { boss.attackMode = (boss.attackMode === 'single') ? 'volley' : 'single'; } boss.modeSwitchTimer = 240 + Math.random() * 120; boss.attackTimer = 60; } boss.attackTimer--; if (boss.attackTimer <= 0) { const projDir = (player.x < boss.x) ? -1 : 1; const startX = projDir === -1 ? boss.x : boss.x + boss.width; const attackCooldownMultiplier = 1 / (1 + (gameDifficulty - 1) * 0.3); if (boss.attackMode === 'single' || boss.attackMode === 'both') { boss.attackTimer = (90 + Math.random() * 60) * attackCooldownMultiplier; bossProjectiles.push({ x: startX, y: player.y + (player.height / 2) - 10, width: 30, height: 10, speed: 6 * (1 + (gameDifficulty - 1) * 0.15) * projDir }); } if (boss.attackMode === 'volley' || boss.attackMode === 'both') { boss.attackTimer = (150 + Math.random() * 60) * attackCooldownMultiplier; for (let i = 0; i < 3; i++) { bossProjectiles.push({ x: startX, y: boss.y + 20 + (i * 30), width: 20, height: 15, speed: 4 * (1 + (gameDifficulty - 1) * 0.15) * projDir }); } } } }
    function updateProjectiles() { bossProjectiles.forEach((proj, index) => { proj.x += proj.speed; createParticles(proj.x + proj.width / 2, proj.y + proj.height / 2, 1, { color: '#E6E6FA', life: 15, minSize: 1, maxSize: 3, speed: 0.5, gravity: 0 }); const worldLimit = gameState === 'in_boss_room' ? canvas.width : levels[currentLevel].worldWidth; if (proj.x + proj.width < 0 || proj.x > worldLimit) { createParticles(proj.x, proj.y, 20, { color: '#DDA0DD' }); bossProjectiles.splice(index, 1); } }); }
    function createParticles(x, y, count, options) { const { color = '#FFFFFF', minSpeed = 1, maxSpeed = 3, minSize = 1, maxSize = 3, life = 40, gravity = 0.1, spread = Math.PI * 2 } = options; for (let i = 0; i < count; i++) { const angle = Math.random() * spread - (spread / 2) + (Math.PI / 2); const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: -Math.sin(angle) * speed, size: Math.random() * (maxSize - minSize) + minSize, color, life, initialLife: life, gravity }); } }
    function updateParticles() { for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.life--; if (p.life <= 0) particles.splice(i, 1); } }
    function checkCollisions() { if (gameState === 'playing') { const door = levels[currentLevel].door; if (door && player.x < door.x + door.width && player.x + player.width > door.x && player.y < door.y + door.height && player.y + player.height > door.y) { enterBossRoom(); return; } } coins.forEach(c => { if (!c.collected && player.x < c.x + c.w && player.x + player.width > c.x && player.y < c.y + c.h && player.y + player.height > c.y) { c.collected = true; score += 10; } }); enemies.forEach((e, i) => { if (player.x < e.x + e.w && player.x + player.width > e.x && player.y < e.y + e.h && player.y + player.height > e.y) { if (player.dy > 0 && player.y + player.height < e.y + 20 && e.type !== 'ghost') { createParticles(e.x + e.w / 2, e.y, 20, { color: '#FFD700', maxSpeed: 4, gravity: 0.2 }); enemies.splice(i, 1); score += 50; player.dy = -8; } else { createParticles(player.x, player.y, 30, { color: '#FF4500' }); gameState = 'gameOver'; } } }); if (boss) { if (player.x < boss.x + boss.width && player.x + player.width > boss.x && player.y < boss.y + boss.height && player.y + player.height > boss.y) { if (player.dy > 0 && player.y + player.height < boss.y + 30 && boss.invincibleTimer <= 0) { createParticles(player.x + player.width / 2, boss.y, 40, { color: '#FFFFFF', maxSize: 5, maxSpeed: 5 }); boss.health--; boss.invincibleTimer = 60; player.dy = -10; if (boss.health <= 0) { createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 200, { color: '#FFD700', life: 100, maxSpeed: 7 }); score += 500 * gameDifficulty; goToNextLevel(); } } else if (boss.invincibleTimer <= 0) { createParticles(player.x, player.y, 30, { color: '#FF4500' }); gameState = 'gameOver'; } } bossProjectiles.forEach((proj, i) => { if (player.x < proj.x + proj.width && player.x + player.width > proj.x && player.y < proj.y + proj.height && player.y + player.height > proj.y) { createParticles(proj.x, proj.y, 30, { color: '#FF4500' }); bossProjectiles.splice(i, 1); gameState = 'gameOver'; } }); } }

    function drawLevelBackground() {
        const levelData = levels[currentLevel];
        if (!levelData) return;
    
        const scene = gameState === 'in_boss_room' ? levelData.bossRoom : levelData;
    
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!scene.background) return;
    
        scene.background.forEach(layer => {
            const img = layer.img;
            if (!img || !img.complete || img.naturalHeight === 0) { return; }
    
            const scrollX = camera.x * layer.scrollFactor;
            const scrollY = camera.y * layer.scrollFactor;
            const imgWidth = img.width;
            const xOffset = scrollX % imgWidth;
            const imgHeight = canvas.height; 
            
            ctx.drawImage(img, -xOffset, -scrollY, imgWidth, imgHeight);
            ctx.drawImage(img, imgWidth - xOffset, -scrollY, imgWidth, imgHeight);
        });
    }

    function drawDecorations() {
        const levelData = levels[currentLevel];
        if (!levelData) return;
    
        const scene = gameState === 'in_boss_room' ? levelData.bossRoom : levelData;
        if (!scene.decorations) return;
    
        scene.decorations.forEach(deco => {
            if (deco.img.complete && deco.img.naturalHeight !== 0) {
                ctx.drawImage(deco.img, deco.x, deco.y, deco.w, deco.h);
            }
        });
    }

    // UPDATED: Added drawing for moving platforms
    function draw() {
        if (assetsLoaded < totalAssets) {
            ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width, canvas.height);
            ctx.fillStyle = 'white'; ctx.font = '20px "Courier New"'; ctx.textAlign = 'center';
            ctx.fillText(`Carregando... ${assetsLoaded} / ${totalAssets}`, canvas.width/2, canvas.height/2);
            return;
        }

        drawLevelBackground();

        if (gameState !== 'playing' && gameState !== 'in_boss_room') {
            let message = '', subMessage = '', prompt = 'Pressione ESPAÇO para voltar ao menu';
            if (gameState === 'gameOver') { message = 'FIM DE JOGO'; subMessage = `Pontuação Final: ${score}`; }
            else if (gameState === 'victory') { message = 'VOCÊ VENCEU!'; subMessage = `Dificuldade ${gameDifficulty} desbloqueada!`; prompt = 'Pressione ESPAÇO para o próximo desafio!'; }
            if (message) { ctx.fillStyle = 'black'; ctx.font = '40px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40); ctx.font = '24px "Courier New"'; ctx.fillText(subMessage, canvas.width / 2, canvas.height / 2); ctx.font = '20px "Courier New"'; ctx.fillText(prompt, canvas.width / 2, canvas.height / 2 + 40); }
            return;
        }

        if (levelStartTimer > 0) { 
            levelStartTimer--; 
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height); 
            ctx.fillStyle = 'white'; ctx.font = '50px "Courier New"'; ctx.textAlign = 'center'; 
            if (gameState === 'in_boss_room' && boss) {
                const bossName = `Chefe: ${boss.img.src.split('/').pop().split('.')[0].toUpperCase()}`;
                ctx.fillText(`Fase ${currentLevel}`, canvas.width / 2, canvas.height / 2 - 30); 
                ctx.font = '30px "Courier New"'; 
                ctx.fillText(bossName, canvas.width/2, canvas.height/2 + 20);
            } else {
                ctx.fillText(`Fase ${currentLevel}`, canvas.width / 2, canvas.height / 2);
            }
            return; 
        }

        ctx.save(); 
        ctx.translate(-camera.x, -camera.y);

        drawDecorations();
        
        const platformPattern = (gameState === 'in_boss_room') ? castleBricksPattern : grassDirtPattern;
        ctx.fillStyle = platformPattern;
        [...platforms, ...movingPlatforms].forEach(p => { // Draw all platforms
            ctx.fillRect(p.x, p.y, p.width, p.height);
        });

        if (gameState === 'playing') {
            const door = levels[currentLevel].door;
            if (door) {
                ctx.fillStyle = '#8B4513'; ctx.fillRect(door.x, door.y, door.width, door.height);
                ctx.fillStyle = '#A0522D'; ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10);
                ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(door.x + door.width - 20, door.y + door.height/2, 5, 0, Math.PI * 2); ctx.fill();
            }
        }

        coins.forEach(c => { if (!c.collected) { ctx.fillStyle = '#FFD700'; ctx.fillRect(c.x, c.y, c.w, c.h); } });
        enemies.forEach(enemy => { ctx.save(); let img = enemySprite; let color = '#8B0000'; switch(enemy.type) { case 'ground': if (enemy.dir === -1) { ctx.scale(-1, 1); ctx.drawImage(img, -enemy.x - enemy.w, enemy.y, enemy.w, enemy.h); } else { ctx.drawImage(img, enemy.x, enemy.y, enemy.w, enemy.h); } break; case 'piranha': color = '#2E8B57'; ctx.fillStyle = color; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); break; case 'ghost': color = '#E6E6FA'; ctx.globalAlpha = 0.8; ctx.fillStyle = color; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); break; case 'flying': color = '#4682B4'; ctx.fillStyle = color; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); break; } ctx.restore(); });
        
        if (boss) { ctx.save(); if (boss.invincibleTimer > 0 && Math.floor(boss.invincibleTimer / 5) % 2 === 0) { ctx.globalAlpha = 0.5; } const bossImg = boss.img; if (bossImg.complete && bossImg.naturalHeight !== 0) { ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height); } else { ctx.fillStyle = '#A020F0'; ctx.fillRect(boss.x, boss.y, boss.width, boss.height); } ctx.restore(); }
        bossProjectiles.forEach(proj => drawProjectile(proj));
        drawParticles(); 
        
        player.draw();

        ctx.restore();

        const hudColor = (gameState === 'in_boss_room') ? 'white' : 'black';
        ctx.fillStyle = hudColor; ctx.font = '20px "Courier New"'; ctx.textAlign = 'left'; ctx.fillText(`Pontuação: ${score}`, 10, 30);
        if (boss) { const bossName = `CHEFE: ${boss.img.src.split('/').pop().split('.')[0].toUpperCase()}`; ctx.fillStyle = '#EEE'; ctx.font = 'bold 16px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(bossName, canvas.width / 2, 30); ctx.fillStyle = '#333'; ctx.fillRect(canvas.width / 2 - 101, 39, 202, 22); ctx.fillStyle = '#ddd'; ctx.fillRect(canvas.width / 2 - 100, 40, 200, 20); ctx.fillStyle = boss.health / boss.maxHealth > 0.5 ? '#28a745' : boss.health / boss.maxHealth > 0.2 ? '#ffc107' : '#dc3545'; ctx.fillRect(canvas.width / 2 - 100, 40, (boss.health / boss.maxHealth) * 200, 20); }
    }

    function drawProjectile(proj) { const g = ctx.createRadialGradient(proj.x+proj.width/2, proj.y+proj.height/2,0,proj.x+proj.width/2,proj.y+proj.height/2,proj.width*.8); g.addColorStop(0,'#fff'); g.addColorStop(.4,'#dda0dd'); g.addColorStop(1,'#9400d300'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(proj.x+proj.width/2,proj.y+proj.height/2,proj.width,0,Math.PI*2); ctx.fill(); }
    function drawParticles() { particles.forEach(p => { ctx.globalAlpha = p.life / p.initialLife; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1.0; }

    function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
    
    loadDifficulty();
    showMainMenu();
    requestAnimationFrame(gameLoop);
    
    // UPDATED: Jump key logic now handles double jumps
    window.addEventListener('keydown', (e) => {
        if (gameState === 'playing' || gameState === 'in_boss_room') {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left.pressed = true;
            else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right.pressed = true;
            else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                if (player.grounded) { // First jump
                    player.dy = -15;
                    player.isJumping = true;
                    player.grounded = false; // Player leaves the ground
                } else if (player.canDoubleJump) { // Second jump
                    player.dy = -12; // Make the double jump slightly less powerful
                    player.canDoubleJump = false; // Use the double jump
                    // Add a small particle effect for feedback
                    createParticles(player.x + player.width / 2, player.y + player.height / 2, 10, { color: '#87CEFA', maxSpeed: 2, gravity: 0.05, life: 20 });
                }
            }
        } else if (e.code === 'Space') {
            if (gameState === 'victory') { gameState = 'menu'; showMainMenu(); }
            else if (gameState === 'gameOver') showMainMenu();
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left.pressed = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right.pressed = false;
    });
});