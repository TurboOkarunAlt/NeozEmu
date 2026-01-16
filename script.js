let gameData = {};
let currentView = 'systems'; // 'systems' or 'games'
let systems = [];
let currentSystemIndex = 0;
let currentGameIndex = 0;

async function loadData() {
    try {
        const response = await fetch('games.json');
        gameData = await response.json();
        systems = Object.keys(gameData);
        renderSystems();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
}

function renderSystems() {
    const container = document.getElementById('system-selector');
    const gameContainer = document.getElementById('game-browser-container');
    const titleEl = document.getElementById('system-title');
    
    container.style.display = 'flex';
    gameContainer.style.display = 'none';
    titleEl.textContent = 'R36S MAX • SYSTEMS';
    
    container.innerHTML = '';
    systems.forEach((sys, index) => {
        const card = document.createElement('div');
        card.className = `system-card ${index === currentSystemIndex ? 'active' : ''}`;
        
        // Simple logo mapping
        let logo = `assets/${sys}.png`;
        if(sys === 'GBA') logo = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/dee38e10-db68-462d-9df7-46b87d4c7876/ddt5qyh-66edc63e-cdbe-4441-8af8-b1777728a189.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi9kZWUzOGUxMC1kYjY4LTQ2MmQtOWRmNy00NmI4N2Q0Yzc4NzYvZGR0NXF5aC02NmVkYzYzZS1jZGJlLTQ0NDEtOGFmOC1iMTc3NzcyOGExODkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.P8SBYeh4VwyNrahShlKjxkk9JS8_JcFqXN_6qBakKbw';

        card.innerHTML = `
            <img src="${logo}" alt="${sys}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Game_Boy_Advance_logo.svg/1200px-Game_Boy_Advance_logo.svg.png'">
            <span>${sys}</span>
        `;
        
        // Add mouse support for system selection
        card.onmouseenter = () => {
            currentSystemIndex = index;
            renderSystems();
        };
        card.onclick = () => {
            currentView = 'games';
            currentGameIndex = 0;
            renderGames();
        };
        
        container.appendChild(card);
    });
}

function renderGames() {
    const container = document.getElementById('system-selector');
    const gameContainer = document.getElementById('game-browser-container');
    const list = document.getElementById('game-list');
    const titleEl = document.getElementById('system-title');
    
    container.style.display = 'none';
    gameContainer.style.display = 'flex';
    titleEl.textContent = `R36S MAX • ${systems[currentSystemIndex]}`;
    
    const games = gameData[systems[currentSystemIndex]];
    list.innerHTML = '';
    games.forEach((game, index) => {
        const item = document.createElement('div');
        item.className = `game-item ${index === currentGameIndex ? 'active' : ''}`;
        item.innerHTML = `<div class="game-item-title">${game.title}</div>`;
        
        // Add mouse support for game selection
        item.onmouseenter = () => {
            currentGameIndex = index;
            renderGames();
        };
        item.onclick = () => {
            launchGame();
        };
        
        list.appendChild(item);
    });
    updatePreview();
}

function updatePreview() {
    const games = gameData[systems[currentSystemIndex]];
    const game = games[currentGameIndex];
    const coverEl = document.getElementById('current-cover');
    const titleEl = document.getElementById('game-title');
    const metaEl = document.getElementById('game-meta');
    
    if (coverEl) coverEl.src = game.cover;
    if (titleEl) titleEl.textContent = game.title;
    if (metaEl) metaEl.textContent = `${game.publisher} • ${game.year}`;
}

function launchGame() {
    const games = gameData[systems[currentSystemIndex]];
    const game = games[currentGameIndex];
    if (game.file !== "#") {
        const overlay = document.getElementById('game-overlay');
        const frame = document.getElementById('game-frame');
        if (overlay && frame) {
            frame.src = game.file;
            overlay.style.display = 'block';
            currentView = 'overlay';
        }
    }
}

function closeGame() {
    const overlay = document.getElementById('game-overlay');
    const frame = document.getElementById('game-frame');
    if (overlay && frame) {
        frame.src = 'about:blank';
        overlay.style.display = 'none';
        currentView = 'games';
    }
}

document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    if (currentView === 'overlay') {
        if (key === 'Escape' || key.toLowerCase() === 'b') {
            e.preventDefault();
            closeGame();
        }
        return;
    }
    
    if (currentView === 'systems') {
        if (key === 'ArrowLeft' || key === 'ArrowUp') {
            e.preventDefault();
            currentSystemIndex = (currentSystemIndex > 0) ? currentSystemIndex - 1 : systems.length - 1;
            renderSystems();
        } else if (key === 'ArrowRight' || key === 'ArrowDown') {
            e.preventDefault();
            currentSystemIndex = (currentSystemIndex < systems.length - 1) ? currentSystemIndex + 1 : 0;
            renderSystems();
        } else if (key === 'Enter' || key.toLowerCase() === 'a') {
            e.preventDefault();
            currentView = 'games';
            currentGameIndex = 0;
            renderGames();
        }
    } else {
        if (key === 'ArrowUp') {
            e.preventDefault();
            const games = gameData[systems[currentSystemIndex]];
            currentGameIndex = (currentGameIndex > 0) ? currentGameIndex - 1 : games.length - 1;
            renderGames();
            const activeItem = document.querySelector('.game-item.active');
            if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else if (key === 'ArrowDown') {
            e.preventDefault();
            const games = gameData[systems[currentSystemIndex]];
            currentGameIndex = (currentGameIndex < games.length - 1) ? currentGameIndex + 1 : 0;
            renderGames();
            const activeItem = document.querySelector('.game-item.active');
            if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else if (key === 'Backspace' || key.toLowerCase() === 'b') {
            e.preventDefault();
            currentView = 'systems';
            renderSystems();
        } else if (key === 'Enter' || key.toLowerCase() === 'a') {
            e.preventDefault();
            launchGame();
        }
    }
});

// Initialize
setInterval(updateClock, 1000);
updateClock();
loadData();

// Add mouse support for footer buttons
const hintA = document.getElementById('hint-a');
const hintB = document.getElementById('hint-b');

if (hintA) {
    hintA.onclick = () => {
        if (currentView === 'systems') {
            currentView = 'games';
            currentGameIndex = 0;
            renderGames();
        } else {
            launchGame();
        }
    };
}

if (hintB) {
    hintB.onclick = () => {
        if (currentView === 'games') {
            currentView = 'systems';
            renderSystems();
        }
    };
}
