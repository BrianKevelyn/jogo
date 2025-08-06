document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO MENU ---
    const mainMenu = document.getElementById('mainMenu');
    const characterSelectMenu = document.getElementById('characterSelectMenu');
    const levelSelectMenu = document.getElementById('levelSelectMenu');
    const shopMenu = document.getElementById('shopMenu');
    const startGameBtn = document.getElementById('startGameBtn');
    const selectCharacterBtn = document.getElementById('selectCharacterBtn');
    const selectLevelBtn = document.getElementById('selectLevelBtn');
    const shopBtn = document.getElementById('shopBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const backToMenuFromLevelSelectBtn = document.getElementById('backToMenuFromLevelSelectBtn');
    const backToMenuFromShopBtn = document.getElementById('backToMenuFromShopBtn');
    const characterOptions = document.querySelectorAll('.character-option');
    const levelSelectButtons = document.querySelectorAll('.level-select-btn');
    const difficultyDisplay = document.getElementById('difficultyDisplay');
    const shopPointsDisplay = document.getElementById('shopPointsDisplay');
    const shopItemsContainer = document.getElementById('shopItems');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // --- CONFIGURAÇÕES GLOBAIS ---
    let gameState = 'menu';
    let currentLevel = 1;
    let score = 0;
    let gameDifficulty = 1;
    let levelStars = { 1: 0, 2: 0, 3: 0 };
    let totalEnemiesInLevel = 0;
    let enemiesDefeatedInLevel = 0;
    let starsEarnedThisLevel = 0;
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
            movingPlatforms: [ { x: 400, y: 380, width: 120, height: 20, startX: 400, endX: 700, speed: 1, dir: 1, isMoving: true } ],
            coins: [ { x: 250, y: 280, w: 20, h: 20, collected: false }, { x: 450, y: 210, w: 20, h: 20, collected: false }, { x: 950, y: 260, w: 20, h: 20, collected: false }, { x: 1250, y: 180, w: 20, h: 20, collected: false }, { x: 1800, y: 200, w: 20, h: 20, collected: false } ],
            enemies: [ { type: 'ground', x: 300, y: 382, w: 40, h: 38, speed: 1, dir: 1, health: 1 }, { type: 'ground', x: 1000, y: 382, w: 40, h: 38, speed: 1.5, dir: -1, health: 1 }, { type: 'piranha', x: 1625, y: 300, w: 40, h: 40, health: 1 }, { type: 'ground', x: 1750, y: 382, w: 40, h: 38, speed: 0.8, dir: 1, health: 1 } ],
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
            enemies: [ { type: 'ground', x: 100, y: 1112, w: 40, h: 38, speed: 1.5, dir: 1, health: 1 }, { type: 'flying', x: 100, y: 600, w: 40, h: 38, speed: 1, range: 100, health: 1 }, { type: 'flying', x: 700, y: 800, w: 40, h: 38, speed: 1, range: 100, health: 1 } ],
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
            enemies: [ { type: 'ground', x: 250, y: 382, w: 40, h: 38, speed: 1, dir: 1, health: 2 }, { type: 'ghost', x: 800, y: 300, w: 40, h: 40, speed: 1.5, health: 2 }, { type: 'ground', x: 950, y: 382, w: 40, h: 38, speed: 2, dir: 1, health: 2 }, { type: 'ground', x: 1300, y: 382, w: 40, h: 38, speed: 2, dir: -1, health: 2 }, { type: 'ghost', x: 1600, y: 200, w: 40, h: 40, speed: 1.5, health: 2 }, { type: 'ground', x: 1950, y: 382, w: 40, h: 38, speed: 1.2, dir: -1, health: 2 }, { type: 'piranha', x: 2450, y: 320, w: 40, h: 40, health: 2 }, { type: 'ground', x: 2650, y: 382, w: 40, h: 38, speed: 1.5, dir: -1, health: 2 } ],
            door: { x: 3100, y: 320, width: 80, height: 100 },
            bossRoom: {
                background: [ { img: castleWallTexture, scrollFactor: 0.5 } ],
                decorations: [ { img: torchSprite, x: 50, y: 250, w: 40, h: 80 }, { img: torchSprite, x: 710, y: 250, w: 40, h: 80 } ],
                platforms: [{ x: 0, y: 420, width: 150, height: 30 }, {x: 200, y: 350, width: 400, height: 20}, { x: 650, y: 420, width: 150, height: 30 }],
                boss: { x: 700, y: 320, width: 100, height: 100, health: 20, speed: 3, attackMode: 'both', img: boss3Sprite }
            }
        }
    };
    
    // --- WEAPON SYSTEM & PERSISTENCE ---
    const weapons = {
        0: { name: 'Fireball', desc: 'Um projétil de fogo básico.', damage: 1, cost: 0, color: '#FF4500', projSpeed: 7, cooldown: 40, img: 'assets/fireball-icon.png' },
        1: { name: 'Ice Shard', desc: 'Rápido e perfurante. Causa mais dano.', damage: 2, cost: 250, color: '#00BFFF', projSpeed: 9, cooldown: 30, img: 'assets/iceshard-icon.png' },
        2: { name: 'Lightning Bolt', desc: 'Um raio devastador de alta velocidade.', damage: 4, cost: 600, color: '#FFD700', projSpeed: 12, cooldown: 25, img: 'assets/lightning-icon.png' }
    };
    let unlockedWeapons = { 0: true, 1: false, 2: false };
    let equippedWeapon = 0;

    let assetsLoaded = 0;
    const totalAssets = 17; 
    function onAssetLoad() { if (++assetsLoaded === totalAssets) { grassDirtPattern = ctx.createPattern(grassDirtTexture, 'repeat'); castleBricksPattern = ctx.createPattern(castleBricksTexture, 'repeat'); castleWallPattern = ctx.createPattern(castleWallTexture, 'repeat'); } }
    playerSprite.onload = onAssetLoad; playerSprite.onerror = onAssetLoad; enemySprite.onload = onAssetLoad; enemySprite.onerror = onAssetLoad; boss1Sprite.onload = onAssetLoad; boss1Sprite.onerror = onAssetLoad; boss2Sprite.onload = onAssetLoad; boss2Sprite.onerror = onAssetLoad; boss3Sprite.onload = onAssetLoad; boss3Sprite.onerror = onAssetLoad; bgSky.onload = onAssetLoad; bgSky.onerror = onAssetLoad; bgHillsFar.onload = onAssetLoad; bgHillsFar.onerror = onAssetLoad; bgHillsNear.onload = onAssetLoad; bgHillsNear.onerror = onAssetLoad; bgVertical.onload = onAssetLoad; bgVertical.onerror = onAssetLoad; bgLavaSky.onload = onAssetLoad; bgLavaSky.onerror = onAssetLoad; bgVolcano.onload = onAssetLoad; bgVolcano.onerror = onAssetLoad; grassDirtTexture.onload = onAssetLoad; grassDirtTexture.onerror = onAssetLoad; bushSprite.onload = onAssetLoad; bushSprite.onerror = onAssetLoad; rockSprite.onload = onAssetLoad; rockSprite.onerror = onAssetLoad; castleWallTexture.onload = onAssetLoad; castleWallTexture.onerror = onAssetLoad; castleBricksTexture.onload = onAssetLoad; castleBricksTexture.onerror = onAssetLoad; torchSprite.onload = onAssetLoad; torchSprite.onerror = onAssetLoad;

    const player = {
        x: 100, y: 350, width: 40, height: 50,
        dx: 0, dy: 0,
        speed: 5,
        jumpForce: -14,
        isJumping: false,
        grounded: false,
        canDoubleJump: false,
        facing: 'right',
        attackCooldown: 0,
        projectiles: [],
        draw() {
            ctx.save();
            const imageToDraw = playerSprite;
            if (this.facing === 'left') {
                ctx.scale(-1, 1);
                ctx.drawImage(imageToDraw, -this.x - this.width, this.y, this.width, this.height);
            } else {
                ctx.drawImage(imageToDraw, this.x, this.y, this.width, this.height);
            }
            ctx.restore();
        }
    };

    let platforms = [], movingPlatforms = [], coins = [], enemies = [], boss = null, bossProjectiles = [], particles = [];
    const camera = {
        x: 0, y: 0, width: canvas.width, height: canvas.height,
        update() {
            if (gameState === 'in_boss_room' || gameState === 'levelComplete') { this.x = 0; this.y = 0; return; }
            const levelData = levels[currentLevel]; if (!levelData) return;
            if (levelData.type === 'horizontal') {
                this.x = player.x - this.width / 2 + player.width / 2;
                if (this.x < 0) this.x = 0;
                if (this.x + this.width > levelData.worldWidth) this.x = levelData.worldWidth - this.width;
                this.y = 0;
            } else {
                this.y = player.y - this.height / 2 + player.height / 2;
                if (this.y < 0) this.y = 0;
                if (this.y + this.height > levelData.worldHeight) this.y = levelData.worldHeight - this.height;
                this.x = 0;
            }
        }
    };
    const keys = { right: { pressed: false }, left: { pressed: false } };

    // --- PERSISTENCE FUNCTIONS ---
    function saveGameData() {
        localStorage.setItem('playerScore', score);
        localStorage.setItem('unlockedWeapons', JSON.stringify(unlockedWeapons));
        localStorage.setItem('gameDifficulty', gameDifficulty);
        localStorage.setItem('levelStars', JSON.stringify(levelStars));
    }

    function loadGameData() {
        score = parseInt(localStorage.getItem('playerScore')) || 0;
        gameDifficulty = parseInt(localStorage.getItem('gameDifficulty')) || 1;
        const savedWeapons = JSON.parse(localStorage.getItem('unlockedWeapons'));
        if (savedWeapons) unlockedWeapons = savedWeapons;
        const savedStars = JSON.parse(localStorage.getItem('levelStars'));
        if (savedStars) levelStars = savedStars;
    }

    // --- MENU NAVIGATION ---
    function showMainMenu() {
        difficultyDisplay.textContent = `Dificuldade: ${gameDifficulty}`;
        mainMenu.classList.remove('hidden');
        characterSelectMenu.classList.add('hidden');
        levelSelectMenu.classList.add('hidden');
        shopMenu.classList.add('hidden');
        gameState = 'menu';
    }

    function showCharacterSelect() { mainMenu.classList.add('hidden'); characterSelectMenu.classList.remove('hidden'); }
    
    function showLevelSelect() {
        mainMenu.classList.add('hidden');
        levelSelectMenu.classList.remove('hidden');
        for (const levelId in levelStars) {
            const starSpan = document.querySelector(`.stars[data-level-id="${levelId}"]`);
            if (starSpan) {
                starSpan.innerHTML = '★'.repeat(levelStars[levelId]) + '☆'.repeat(3 - levelStars[levelId]);
            }
        }
    }
    
    // --- SHOP FUNCTIONS ---
    function showShop() { mainMenu.classList.add('hidden'); shopMenu.classList.remove('hidden'); updateShopUI(); }

    function updateShopUI() {
        shopPointsDisplay.textContent = `Seus Pontos: ${score}`;
        shopItemsContainer.innerHTML = '';
        for (const id in weapons) {
            const weapon = weapons[id];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';
            let buyButtonHTML = '';
            if (unlockedWeapons[id]) {
                buyButtonHTML = `<span>Adquirido</span>`;
            } else {
                const canAfford = score >= weapon.cost;
                buyButtonHTML = `<button data-id="${id}" class="${canAfford ? '' : 'disabled'}" ${canAfford ? '' : 'disabled'}>Comprar (${weapon.cost} Pts)</button>`;
            }
            itemDiv.innerHTML = `<img src="${weapon.img}" alt="${weapon.name}"><div class="shop-item-details"><h3>${weapon.name}</h3><p>${weapon.desc}</p></div><div class="shop-item-buy">${buyButtonHTML}</div>`;
            shopItemsContainer.appendChild(itemDiv);
        }
        document.querySelectorAll('.shop-item-buy button').forEach(button => { if (!button.disabled) { button.addEventListener('click', buyWeapon); } });
    }

    function buyWeapon(e) {
        const weaponId = e.target.dataset.id;
        const weapon = weapons[weaponId];
        if (score >= weapon.cost && !unlockedWeapons[weaponId]) {
            score -= weapon.cost;
            unlockedWeapons[weaponId] = true;
            saveGameData();
            updateShopUI();
        }
    }

    // --- GAME FLOW ---
    function startNewGame() { currentLevel = 1; startGameFlow(); }
    function startSpecificLevel(level) { currentLevel = level; startGameFlow(); }

    function startGameFlow() {
        mainMenu.classList.add('hidden'); shopMenu.classList.add('hidden'); characterSelectMenu.classList.add('hidden'); levelSelectMenu.classList.add('hidden');
        playerSprite.src = selectedCharacterSrc;
        equippedWeapon = 0;
        if (playerSprite.complete) { initLevel(currentLevel); } 
        else { playerSprite.onload = () => initLevel(currentLevel); }
    }

    function initLevel(levelNumber) {
        const levelData = levels[levelNumber]; if (!levelData) return;
        player.x = 100; player.y = 350; player.dx = 0; player.dy = 0;
        player.facing = 'right'; player.projectiles = [];
        particles = []; bossProjectiles = []; boss = null;
        enemiesDefeatedInLevel = 0;
        platforms = JSON.parse(JSON.stringify(levelData.platforms));
        movingPlatforms = levelData.movingPlatforms ? JSON.parse(JSON.stringify(levelData.movingPlatforms)) : [];
        coins = JSON.parse(JSON.stringify(levelData.coins));
        const difficultySpeedMultiplier = 1 + (gameDifficulty - 1) * 0.2;
        const difficultyHealthMultiplier = 1 + (gameDifficulty - 1) * 0.4;
        enemies = JSON.parse(JSON.stringify(levelData.enemies)).map(e => {
            const base = { ...e, dy: 0, grounded: false };
            base.speed *= difficultySpeedMultiplier;
            base.health = Math.round((e.health || 1) * difficultyHealthMultiplier);
            if (e.type === 'piranha') { base.state = 'hiding'; base.timer = Math.random() * 120 + 60; base.initialY = e.y; }
            if (e.type === 'flying') { base.initialY = e.y; base.dir = 1; }
            return base;
        });
        totalEnemiesInLevel = enemies.length;
        if (levelData.type === 'vertical') { player.x = canvas.width / 2; player.y = 1100; }
        camera.update();
        gameState = 'playing';
        levelStartTimer = 120;
    }

    function handleLevelEnd(playerSurvived) {
        if (playerSurvived) {
            starsEarnedThisLevel = (enemiesDefeatedInLevel === totalEnemiesInLevel) ? 3 : 2;
        } else {
            starsEarnedThisLevel = (enemiesDefeatedInLevel > 0) ? 1 : 0;
        }
        if (starsEarnedThisLevel > (levelStars[currentLevel] || 0)) {
            levelStars[currentLevel] = starsEarnedThisLevel;
        }
        saveGameData();
    }
    
    function setGameOver() {
        if (gameState !== 'gameOver') {
            handleLevelEnd(false);
            gameState = 'gameOver';
        }
    }

    function enterBossRoom() {
        const levelData = levels[currentLevel]; if (!levelData || !levelData.bossRoom) return;
        gameState = 'in_boss_room';
        platforms = JSON.parse(JSON.stringify(levelData.bossRoom.platforms));
        movingPlatforms = []; enemies = []; coins = []; player.projectiles = [];
        player.x = 100; player.y = 300; player.dx = 0;
        const bossData = levelData.bossRoom.boss;
        const difficultyHealthMultiplier = 1 + (gameDifficulty - 1) * 0.5;
        const difficultySpeedMultiplier = 1 + (gameDifficulty - 1) * 0.2;
        boss = { ...bossData, maxHealth: Math.round(bossData.health * difficultyHealthMultiplier), health: Math.round(bossData.health * difficultyHealthMultiplier), speed: bossData.speed * difficultySpeedMultiplier, direction: 1, attackTimer: 120, invincibleTimer: 0, modeSwitchTimer: 300 };
        camera.update();
        levelStartTimer = 120;
    }

    function proceedToNextLevel() {
        boss = null;
        currentLevel++;
        if (levels[currentLevel]) {
            initLevel(currentLevel);
        } else {
            gameDifficulty++;
            gameState = 'victory';
            saveGameData();
        }
    }
    
    function triggerLevelComplete() {
        if (gameState !== 'levelComplete') {
            handleLevelEnd(true);
            gameState = 'levelComplete';
        }
    }

    // --- UPDATE LOOPS ---
    function update() {
        if (gameState !== 'playing' && gameState !== 'in_boss_room') return;
        if (levelStartTimer > 0) return;
        
        updatePlayer();
        updateMovingPlatforms();
        updateProjectiles(player.projectiles, platforms, movingPlatforms);
        if (gameState === 'playing') updateEnemies();
        if (gameState === 'in_boss_room' && boss) { updateBoss(); updateProjectiles(bossProjectiles); }
        updateParticles();
        checkCollisions();
        camera.update();
    }

    function updatePlayer() {
        if (player.attackCooldown > 0) player.attackCooldown--;
        if (keys.right.pressed) { player.dx = player.speed; player.facing = 'right'; } 
        else if (keys.left.pressed) { player.dx = -player.speed; player.facing = 'left'; }
        else { player.dx = 0; }
    
        player.dy += gravity;
        player.x += player.dx;
    
        const allPlatforms = [...platforms, ...movingPlatforms];
        allPlatforms.forEach(p => {
            if (player.y + player.height > p.y && player.y < p.y + p.height && player.x + player.width > p.x && player.x < p.x + p.width) {
                if (player.dx > 0) player.x = p.x - player.width;
                else if (player.dx < 0) player.x = p.x + p.width;
            }
        });
    
        player.y += player.dy;
        player.grounded = false;
    
        allPlatforms.forEach(p => {
            // Check for jump-through condition
            if (player.dy > 0 && // Is falling
                (player.y + player.height - player.dy) <= p.y && // Was above platform last frame
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                player.y + player.height > p.y)
            {
                player.y = p.y - player.height;
                player.dy = 0;
                player.isJumping = false;
                player.grounded = true;
                player.canDoubleJump = true;
                if (p.isMoving) player.x += p.speed * p.dir;
            }
        });

        const levelData = levels[currentLevel];
        const worldLimitX = (gameState === 'in_boss_room') ? canvas.width : (levelData.type === 'horizontal' ? levelData.worldWidth : canvas.width);
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > worldLimitX) player.x = worldLimitX - player.width;
        const fallBoundary = levelData.type === 'vertical' ? levelData.worldHeight + player.height : canvas.height * 2;
        if (player.y > fallBoundary) setGameOver();
    }

    function updateMovingPlatforms() { movingPlatforms.forEach(p => { p.x += p.speed * p.dir; if (p.dir === 1 && p.x + p.width >= p.endX) p.dir = -1; else if (p.dir === -1 && p.x <= p.startX) p.dir = 1; }); }
    function updateEnemies() { const allPlatforms = [...platforms, ...movingPlatforms]; enemies.forEach(enemy => { switch(enemy.type) { case 'ground': if (!enemy.grounded) { enemy.dy += gravity; enemy.y += enemy.dy; } enemy.grounded = false; let onAPlatform = false; allPlatforms.forEach(p => { if (enemy.x < p.x + p.width && enemy.x + enemy.w > p.x && enemy.y + enemy.h >= p.y && enemy.y + enemy.h <= p.y + p.height + 1) { enemy.dy = 0; enemy.grounded = true; onAPlatform = true; enemy.y = p.y - enemy.h; } }); if (enemy.grounded) { enemy.x += enemy.speed * enemy.dir; const platformUnder = allPlatforms.find(p => enemy.y + enemy.h === p.y && enemy.x + enemy.w >= p.x && enemy.x <= p.x + p.width); if (platformUnder) { if ((enemy.dir === 1 && enemy.x + enemy.w > platformUnder.x + platformUnder.width) || (enemy.dir === -1 && enemy.x < platformUnder.x)) { enemy.dir *= -1; } } else if (onAPlatform) { enemy.dir *= -1; } } break; case 'piranha': enemy.timer--; if (enemy.timer <= 0) { enemy.state = (enemy.state === 'hiding') ? 'attacking' : 'hiding'; enemy.timer = (enemy.state === 'hiding') ? 180 : 120; } if (enemy.state === 'attacking') { enemy.y = Math.max(enemy.y - 2, enemy.initialY - enemy.h); } else { enemy.y = Math.min(enemy.y + 2, enemy.initialY); } break; case 'ghost': const dx = player.x - enemy.x; const dy = player.y - enemy.y; const isFacingAway = (player.facing === 'right' && dx < 0) || (player.facing === 'left' && dx > 0); if (isFacingAway) { const distance = Math.sqrt(dx * dx + dy * dy); if (distance > 1) { enemy.x += (dx / distance) * enemy.speed * 0.5; enemy.y += (dy / distance) * enemy.speed * 0.5; } } break; case 'flying': enemy.y += enemy.speed * enemy.dir; if (enemy.y < enemy.initialY - enemy.range || enemy.y > enemy.initialY) { enemy.dir *= -1; } break; } }); }
    function updateBoss() { if (boss.invincibleTimer > 0) boss.invincibleTimer--; boss.x += boss.speed * boss.direction; if (boss.x < 0 || boss.x + boss.width > canvas.width) { boss.direction *= -1; } boss.modeSwitchTimer--; if (boss.modeSwitchTimer <= 0) { const modes = ['single', 'volley']; if (boss.attackMode === 'both') { boss.attackMode = modes[Math.floor(Math.random()*modes.length)]; } else { boss.attackMode = (boss.attackMode === 'single') ? 'volley' : 'single'; } boss.modeSwitchTimer = 240 + Math.random() * 120; boss.attackTimer = 60; } boss.attackTimer--; if (boss.attackTimer <= 0) { const projDir = (player.x < boss.x) ? -1 : 1; const startX = projDir === -1 ? boss.x : boss.x + boss.width; const attackCooldownMultiplier = 1 / (1 + (gameDifficulty - 1) * 0.3); if (boss.attackMode === 'single' || boss.attackMode === 'both') { boss.attackTimer = (90 + Math.random() * 60) * attackCooldownMultiplier; bossProjectiles.push({ x: startX, y: player.y + (player.height / 2) - 10, width: 30, height: 10, speed: 6 * (1 + (gameDifficulty - 1) * 0.15), dir: projDir }); } if (boss.attackMode === 'volley' || boss.attackMode === 'both') { boss.attackTimer = (150 + Math.random() * 60) * attackCooldownMultiplier; for (let i = 0; i < 3; i++) { bossProjectiles.push({ x: startX, y: boss.y + 20 + (i * 30), width: 20, height: 15, speed: 4 * (1 + (gameDifficulty - 1) * 0.15), dir: projDir }); } } } }
    function updateProjectiles(projectileList, platformList = [], movingPlatformList = []) { for (let index = projectileList.length - 1; index >= 0; index--) { const proj = projectileList[index]; proj.x += proj.speed * proj.dir; const worldLimit = gameState === 'in_boss_room' ? canvas.width : levels[currentLevel].worldWidth; if (proj.x + proj.width < -camera.x || proj.x > camera.x + worldLimit) { projectileList.splice(index, 1); continue; } const allPlatforms = [...platformList, ...movingPlatformList]; let hitPlatform = false; for (const p of allPlatforms) { if (proj.x < p.x + p.width && proj.x + proj.width > p.x && proj.y < p.y + p.height && proj.y + proj.height > p.y) { createParticles(proj.x, proj.y, 10, { color: proj.color, maxSize: 4 }); projectileList.splice(index, 1); hitPlatform = true; break; } } } }
    function createParticles(x, y, count, options) { const { color = '#FFFFFF', minSpeed = 1, maxSpeed = 3, minSize = 1, maxSize = 3, life = 40, gravity = 0.1, spread = Math.PI * 2 } = options; for (let i = 0; i < count; i++) { const angle = Math.random() * spread - (spread / 2) + (Math.PI / 2); const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed; particles.push({ x, y, vx: Math.cos(angle) * speed, vy: -Math.sin(angle) * speed, size: Math.random() * (maxSize - minSize) + minSize, color, life, initialLife: life, gravity }); } }
    function updateParticles() { for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.life--; if (p.life <= 0) particles.splice(i, 1); } }
    
    // --- COLLISION LOGIC ---
    function checkCollisions() { 
        if (gameState === 'playing') { const door = levels[currentLevel].door; if (door && player.x < door.x + door.width && player.x + player.width > door.x && player.y < door.y + door.height && player.y + player.height > door.y) { enterBossRoom(); return; } } 
        coins.forEach(c => { if (!c.collected && player.x < c.x + c.w && player.x + player.width > c.x && player.y < c.y + c.h && player.y + player.height > c.y) { c.collected = true; score += 10; saveGameData(); } }); 
        
        for (let pIndex = player.projectiles.length - 1; pIndex >= 0; pIndex--) { const proj = player.projectiles[pIndex]; for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) { const enemy = enemies[eIndex]; if (proj.x < enemy.x + enemy.w && proj.x + proj.width > enemy.x && proj.y < enemy.y + enemy.h && proj.y + proj.height > enemy.y) { createParticles(proj.x, proj.y, 15, { color: proj.color, maxSize: 5 }); player.projectiles.splice(pIndex, 1); enemy.health -= proj.damage; if (enemy.health <= 0) { createParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, 20, { color: '#FFD700', maxSpeed: 4, gravity: 0.2 }); enemies.splice(eIndex, 1); score += 50; enemiesDefeatedInLevel++; saveGameData(); } break; } } }
        enemies.forEach((e, i) => { if (player.x < e.x + e.w && player.x + player.width > e.x && player.y < e.y + e.h && player.y + player.height > e.y) { if (player.dy > 0 && player.y + player.height < e.y + 20 && e.type !== 'ghost') { createParticles(e.x + e.w / 2, e.y, 20, { color: '#FFD700', maxSpeed: 4, gravity: 0.2 }); enemies.splice(i, 1); score += 50; enemiesDefeatedInLevel++; saveGameData(); player.dy = -8; } else { createParticles(player.x, player.y, 30, { color: '#FF4500' }); setGameOver(); } } }); 
        if (boss && boss.health > 0) {
            for (let pIndex = player.projectiles.length - 1; pIndex >= 0; pIndex--) { const proj = player.projectiles[pIndex]; if(proj.x < boss.x + boss.width && proj.x + proj.width > boss.x && proj.y < boss.y + boss.height && proj.y + proj.height > boss.y) { if (boss.invincibleTimer <= 0) { createParticles(proj.x, proj.y, 20, { color: proj.color, maxSize: 6 }); player.projectiles.splice(pIndex, 1); boss.health -= proj.damage; boss.invincibleTimer = 30; if (boss.health <= 0) { createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 200, { color: '#FFD700', life: 100, maxSpeed: 7 }); score += 500 * gameDifficulty; triggerLevelComplete(); } break; } } }
            if (player.x < boss.x + boss.width && player.x + player.width > boss.x && player.y < boss.y + boss.height && player.y + player.height > boss.y) { if (player.dy > 0 && player.y + player.height < boss.y + 30 && boss.invincibleTimer <= 0) { createParticles(player.x + player.width / 2, boss.y, 40, { color: '#FFFFFF', maxSize: 5, maxSpeed: 5 }); boss.health--; boss.invincibleTimer = 60; player.dy = -10; if (boss.health <= 0) { createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 200, { color: '#FFD700', life: 100, maxSpeed: 7 }); score += 500 * gameDifficulty; triggerLevelComplete(); } } else if (boss.invincibleTimer <= 0) { createParticles(player.x, player.y, 30, { color: '#FF4500' }); setGameOver(); } } 
            bossProjectiles.forEach((proj, i) => { if (player.x < proj.x + proj.width && player.x + player.width > proj.x && player.y < proj.y + proj.height && player.y + player.height > proj.y) { createParticles(proj.x, proj.y, 30, { color: '#FF4500' }); bossProjectiles.splice(i, 1); setGameOver(); } }); 
        } 
    }
    
    // --- DRAW FUNCTIONS ---
    function drawLevelBackground() { const levelData = levels[currentLevel]; if (!levelData) return; const scene = gameState === 'in_boss_room' || gameState === 'levelComplete' ? levelData.bossRoom : levelData; ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, canvas.width, canvas.height); if (!scene.background) return; scene.background.forEach(layer => { const img = layer.img; if (!img || !img.complete || img.naturalHeight === 0) return; const scrollX = camera.x * layer.scrollFactor; const scrollY = camera.y * layer.scrollFactor; const imgWidth = img.width; const xOffset = scrollX % imgWidth; const imgHeight = canvas.height; ctx.drawImage(img, -xOffset, -scrollY, imgWidth, imgHeight); if (imgWidth > 0 && imgWidth - xOffset < canvas.width) ctx.drawImage(img, imgWidth - xOffset, -scrollY, imgWidth, imgHeight); }); }
    function drawDecorations() { const levelData = levels[currentLevel]; if (!levelData) return; const scene = gameState === 'in_boss_room' || gameState === 'levelComplete' ? levelData.bossRoom : levelData; if (!scene.decorations) return; scene.decorations.forEach(deco => { if (deco.img.complete && deco.img.naturalHeight !== 0) ctx.drawImage(deco.img, deco.x, deco.y, deco.w, deco.h); }); }
    
    function draw() {
        if (assetsLoaded < totalAssets) { ctx.fillStyle = 'black'; ctx.fillRect(0,0,canvas.width, canvas.height); ctx.fillStyle = 'white'; ctx.font = '20px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(`Carregando... ${assetsLoaded} / ${totalAssets}`, canvas.width/2, canvas.height/2); return; }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLevelBackground();

        if (gameState === 'levelComplete' || gameState === 'gameOver' || gameState === 'victory') {
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            let message = '', subMessage = '', prompt = 'Pressione ESPAÇO para continuar';
            if (gameState === 'gameOver') { message = 'FIM DE JOGO'; subMessage = `Estrelas: ${'★'.repeat(starsEarnedThisLevel)}${'☆'.repeat(3-starsEarnedThisLevel)}`; prompt = 'Pressione ESPAÇO para voltar ao menu'; }
            else if (gameState === 'victory') { message = 'VOCÊ VENCEU!'; subMessage = `Dificuldade ${gameDifficulty} desbloqueada!`; }
            else if (gameState === 'levelComplete') { message = 'FASE COMPLETA!'; subMessage = `Estrelas: ${'★'.repeat(starsEarnedThisLevel)}${'☆'.repeat(3-starsEarnedThisLevel)}`; }
            
            if (message) { ctx.fillStyle = 'white'; ctx.font = '40px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40); ctx.font = '30px "Courier New"'; ctx.fillText(subMessage, canvas.width / 2, canvas.height / 2 + 10); ctx.font = '20px "Courier New"'; ctx.fillText(prompt, canvas.width / 2, canvas.height / 2 + 60); }
            return;
        }

        if (levelStartTimer > 0) { levelStartTimer--; ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'white'; ctx.font = '50px "Courier New"'; ctx.textAlign = 'center'; if (gameState === 'in_boss_room' && boss) { const bossName = `Chefe: ${boss.img.src.split('/').pop().split('.')[0].toUpperCase()}`; ctx.fillText(`Fase ${currentLevel}`, canvas.width / 2, canvas.height / 2 - 30); ctx.font = '30px "Courier New"'; ctx.fillText(bossName, canvas.width/2, canvas.height/2 + 20); } else { ctx.fillText(`Fase ${currentLevel}`, canvas.width / 2, canvas.height / 2); } return; }
        
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        
        drawDecorations();
        const platformPattern = (gameState === 'in_boss_room') ? castleBricksPattern : grassDirtPattern;
        ctx.fillStyle = platformPattern;
        [...platforms, ...movingPlatforms].forEach(p => { ctx.fillRect(p.x, p.y, p.width, p.height); });
        
        if (gameState === 'playing') { const door = levels[currentLevel].door; if (door) { ctx.fillStyle = '#8B4513'; ctx.fillRect(door.x, door.y, door.width, door.height); ctx.fillStyle = '#A0522D'; ctx.fillRect(door.x + 5, door.y + 5, door.width - 10, door.height - 10); ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(door.x + door.width - 20, door.y + door.height/2, 5, 0, Math.PI * 2); ctx.fill(); } }
        coins.forEach(c => { if (!c.collected) { ctx.fillStyle = '#FFD700'; ctx.fillRect(c.x, c.y, c.w, c.h); } });
        enemies.forEach(enemy => { ctx.save(); let img = enemySprite; switch(enemy.type) { case 'ground': if (enemy.dir === -1) { ctx.scale(-1, 1); ctx.drawImage(img, -enemy.x - enemy.w, enemy.y, enemy.w, enemy.h); } else { ctx.drawImage(img, enemy.x, enemy.y, enemy.w, enemy.h); } break; case 'piranha': ctx.fillStyle = '#2E8B57'; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); break; case 'ghost': ctx.globalAlpha = 0.8; ctx.fillStyle = '#E6E6FA'; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); break; case 'flying': ctx.fillStyle = '#4682B4'; ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h); break; } ctx.restore(); });
        
        player.projectiles.forEach(drawPlayerProjectile);
        bossProjectiles.forEach(drawBossProjectile);
        if (boss && boss.health > 0) { ctx.save(); if (boss.invincibleTimer > 0 && Math.floor(boss.invincibleTimer / 5) % 2 === 0) { ctx.globalAlpha = 0.5; } const bossImg = boss.img; if (bossImg.complete && bossImg.naturalHeight !== 0) { ctx.drawImage(bossImg, boss.x, boss.y, boss.width, boss.height); } else { ctx.fillStyle = '#A020F0'; ctx.fillRect(boss.x, boss.y, boss.width, boss.height); } ctx.restore(); }
        drawParticles(); 
        player.draw();
        
        ctx.restore();

        const hudColor = (gameState === 'in_boss_room') ? 'white' : 'black';
        ctx.fillStyle = hudColor; ctx.font = '20px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`Pontos: ${score}`, 10, 30);
        ctx.textAlign = 'right';
        const weapon = weapons[equippedWeapon];
        ctx.fillText(`Arma (Q): ${weapon.name}`, canvas.width - 10, 30);
        
        if (boss && boss.health > 0) { const bossName = `CHEFE: ${boss.img.src.split('/').pop().split('.')[0].toUpperCase()}`; ctx.fillStyle = '#EEE'; ctx.font = 'bold 16px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(bossName, canvas.width / 2, 30); ctx.fillStyle = '#333'; ctx.fillRect(canvas.width / 2 - 101, 39, 202, 22); ctx.fillStyle = '#ddd'; ctx.fillRect(canvas.width / 2 - 100, 40, 200, 20); ctx.fillStyle = boss.health / boss.maxHealth > 0.5 ? '#28a745' : boss.health / boss.maxHealth > 0.2 ? '#ffc107' : '#dc3545'; ctx.fillRect(canvas.width / 2 - 100, 40, (boss.health / boss.maxHealth) * 200, 20); }
    }

    function drawPlayerProjectile(proj) { ctx.fillStyle = proj.color; ctx.beginPath(); ctx.arc(proj.x + proj.width/2, proj.y + proj.height/2, proj.width, 0, Math.PI * 2); ctx.fill(); }
    function drawBossProjectile(proj) { const g = ctx.createRadialGradient(proj.x+proj.width/2, proj.y+proj.height/2,0,proj.x+proj.width/2,proj.y+proj.height/2,proj.width*.8); g.addColorStop(0,'#fff'); g.addColorStop(.4,'#dda0dd'); g.addColorStop(1,'#9400d300'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(proj.x+proj.width/2,proj.y+proj.height/2,proj.width,0,Math.PI*2); ctx.fill(); }
    function drawParticles() { particles.forEach(p => { ctx.globalAlpha = p.life / p.initialLife; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }); ctx.globalAlpha = 1.0; }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    // --- EVENT LISTENERS ---
    window.addEventListener('keydown', (e) => {
        if (gameState === 'playing' || gameState === 'in_boss_room') {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left.pressed = true;
            else if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right.pressed = true;
            else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                if (player.grounded) {
                    player.dy = player.jumpForce; player.isJumping = true; player.grounded = false;
                } else if (player.canDoubleJump) {
                    player.dy = player.jumpForce * 0.9; player.canDoubleJump = false;
                    createParticles(player.x + player.width / 2, player.y + player.height / 2, 10, { color: '#87CEFA', maxSpeed: 2, gravity: 0.05, life: 20 });
                }
            }
            else if (e.code === 'KeyX') {
                if (player.attackCooldown <= 0) {
                    const weapon = weapons[equippedWeapon];
                    player.attackCooldown = weapon.cooldown;
                    const projX = player.facing === 'right' ? player.x + player.width : player.x - 10;
                    player.projectiles.push({ x: projX, y: player.y + player.height / 2 - 5, width: 10, height: 10, speed: weapon.projSpeed, dir: player.facing === 'right' ? 1 : -1, damage: weapon.damage, color: weapon.color });
                }
            } else if (e.code === 'KeyQ') {
                const available = Object.keys(unlockedWeapons).filter(id => unlockedWeapons[id]);
                const currentIndex = available.indexOf(equippedWeapon.toString());
                equippedWeapon = parseInt(available[(currentIndex + 1) % available.length]);
            }
        } else if (e.code === 'Space') {
            if (gameState === 'gameOver' || gameState === 'victory') showMainMenu();
            else if (gameState === 'levelComplete') proceedToNextLevel();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left.pressed = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right.pressed = false;
    });
    
    // --- INITIALIZE GAME ---
    loadGameData();
    showMainMenu();
    requestAnimationFrame(gameLoop);

    startGameBtn.addEventListener('click', startNewGame);
    selectCharacterBtn.addEventListener('click', showCharacterSelect);
    selectLevelBtn.addEventListener('click', showLevelSelect);
    shopBtn.addEventListener('click', showShop);
    backToMenuBtn.addEventListener('click', showMainMenu);
    backToMenuFromLevelSelectBtn.addEventListener('click', showMainMenu);
    backToMenuFromShopBtn.addEventListener('click', showMainMenu);
    characterOptions.forEach(option => { option.addEventListener('click', (e) => { selectedCharacterSrc = e.target.dataset.char; characterOptions.forEach(opt => opt.classList.remove('selected')); e.target.classList.add('selected'); }); });
    levelSelectButtons.forEach(button => { button.addEventListener('click', (e) => { const level = parseInt(e.currentTarget.dataset.level); startSpecificLevel(level); }); });
});