document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const powerBtn = document.getElementById('powerBtn');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const directoryContainer = document.getElementById('directoryContainer');
    const websiteList = document.getElementById('websiteList');
    const searchInput = document.getElementById('searchInput');
    const newWebsiteName = document.getElementById('newWebsiteName');
    const newWebsiteUrl = document.getElementById('newWebsiteUrl');
    const addWebsiteBtn = document.getElementById('addWebsiteBtn');
    const addWebsiteForm = document.getElementById('addWebsiteForm');
    const consoleOutput = document.getElementById('consoleOutput');
    const clearConsoleBtn = document.getElementById('clearConsoleBtn');
    const minimizeConsoleBtn = document.getElementById('minimizeConsoleBtn');
    const consoleElement = document.getElementById('console');
    const hoverSound = document.getElementById('hoverSound');
    const clickSound = document.getElementById('clickSound');
    const loginSound = document.getElementById('loginSound');
    const deniedSound = document.getElementById('deniedSound');
    const powerUpSound = document.getElementById('powerUpSound');
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const closeModal = document.querySelector('.close-modal');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const timeDisplay = document.getElementById('timeDisplay');
    const statusIndicators = document.querySelectorAll('.indicator');
    
    // Admin credentials (in a real app, this would be server-side)
    const ADMIN_CREDENTIALS = {
        username: "admin",
        password: "jarvis123"
    };
    
    // Sample websites data
    let websites = [
        { name: 'Stark Industries', url: 'https://www.starkindustries.com' },
        { name: 'SHIELD Database', url: 'https://www.shield.gov' },
        { name: 'Avengers Initiative', url: 'https://www.avengers.com' },
        { name: 'Wakanda Tech', url: 'https://www.wakanda.tech' },
        { name: 'Arc Reactor Specs', url: 'https://www.arkreactor.net' }
    ];
    
    // System state
    let isPoweredOn = false;
    let isAdminLoggedIn = false;
    
    // Load websites from localStorage if available
    if (localStorage.getItem('jarvisWebsites')) {
        websites = JSON.parse(localStorage.getItem('jarvisWebsites'));
    }
    
    // Initialize the system
    initSystem();
    
    // Update time display
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    setInterval(updateTime, 1000);
    updateTime();
    
    // Event Listeners
    powerBtn.addEventListener('click', togglePower);
    addWebsiteBtn.addEventListener('click', addWebsite);
    searchInput.addEventListener('input', filterWebsites);
    clearConsoleBtn.addEventListener('click', clearConsole);
    minimizeConsoleBtn.addEventListener('click', toggleConsole);
    adminBtn.addEventListener('click', () => {
        if (isAdminLoggedIn) {
            logoutAdmin();
        } else {
            openLoginModal();
        }
    });
    loginBtn.addEventListener('click', loginAdmin);
    closeModal.addEventListener('click', () => loginModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Add hover sound to interactive elements
    const interactiveElements = document.querySelectorAll('button, .website-item, .power-button, .close-modal, input');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            hoverSound.currentTime = 0;
            hoverSound.volume = 0.2;
            hoverSound.play().catch(e => console.log('Audio play error:', e));
        });
        
        if (element.tagName === 'BUTTON' || element.classList.contains('website-item') || element.classList.contains('close-modal')) {
            element.addEventListener('click', () => {
                clickSound.currentTime = 0;
                clickSound.volume = 0.3;
                clickSound.play().catch(e => console.log('Audio play error:', e));
            });
        }
    });
    
    // Functions
    function initSystem() {
        logToConsole('> INITIALIZING J.A.R.V.I.S. MARK VII SYSTEM...');
        activateIndicator('online');
        
        setTimeout(() => {
            logToConsole('> RUNNING DIAGNOSTICS...');
            activateIndicator('defense');
        }, 1000);
        
        setTimeout(() => {
            logToConsole('> CALIBRATING ARMOR SYSTEMS...');
            activateIndicator('weapons');
        }, 2000);
        
        setTimeout(() => {
            logToConsole('> ALL SYSTEMS NOMINAL');
            powerOn();
        }, 3000);
    }
    
    function activateIndicator(status) {
        statusIndicators.forEach(indicator => {
            if (indicator.dataset.status === status) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    function powerOn() {
        isPoweredOn = true;
        powerBtn.classList.remove('off');
        powerUpSound.currentTime = 0;
        powerUpSound.volume = 0.3;
        powerUpSound.play().catch(e => console.log('Audio play error:', e));
        
        setTimeout(() => {
            welcomeMessage.classList.add('hidden');
            directoryContainer.classList.remove('hidden');
            setTimeout(() => {
                directoryContainer.classList.add('visible');
                renderWebsites();
                adminBtn.classList.remove('hidden');
            }, 100);
        }, 11500); // After typing animations complete
    }
    
    function togglePower() {
        if (isPoweredOn) {
            // Power off
            isPoweredOn = false;
            powerBtn.classList.add('off');
            statusIndicators.forEach(indicator => indicator.classList.remove('active'));
            welcomeMessage.classList.remove('hidden');
            directoryContainer.classList.remove('visible');
            adminBtn.classList.add('hidden');
            setTimeout(() => {
                directoryContainer.classList.add('hidden');
            }, 500);
            logToConsole('> SYSTEM SHUTDOWN INITIATED...');
        } else {
            // Power on
            initSystem();
        }
    }
    
    function renderWebsites(filter = '') {
        websiteList.innerHTML = '';
        
        const filteredWebsites = websites.filter(website => 
            website.name.toLowerCase().includes(filter.toLowerCase()) || 
            website.url.toLowerCase().includes(filter.toLowerCase())
        );
        
        if (filteredWebsites.length === 0) {
            websiteList.innerHTML = '<p class="no-results">NO WEBSITES FOUND MATCHING YOUR SEARCH.</p>';
            return;
        }
        
        filteredWebsites.forEach((website, index) => {
            const websiteElement = document.createElement('div');
            websiteElement.classList.add('website-item');
            
            // Get domain for favicon
            let domain;
            try {
                domain = new URL(website.url).hostname.replace('www.', '');
            } catch {
                domain = 'globe';
            }
            
            websiteElement.innerHTML = `
                <div class="website-icon">
                    <i class="fas fa-${getIconForDomain(domain)}"></i>
                </div>
                <div class="website-name">${website.name}</div>
                <div class="website-url">${website.url}</div>
                ${isAdminLoggedIn ? `<button class="delete-btn" data-index="${index}"><i class="fas fa-times"></i></button>` : ''}
            `;
            
            websiteElement.addEventListener('click', (e) => {
                // Don't navigate if clicking on delete button
                if (!e.target.closest('.delete-btn')) {
                    logToConsole(`> ACCESSING ${website.name}...`);
                    window.open(website.url, '_blank');
                }
            });
            
            websiteList.appendChild(websiteElement);
        });
        
        // Add event listeners to delete buttons
        if (isAdminLoggedIn) {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteWebsite(parseInt(btn.dataset.index));
                });
            });
        }
    }
    
    function getIconForDomain(domain) {
        const iconMap = {
            'starkindustries.com': 'industry',
            'shield.gov': 'shield-alt',
            'avengers.com': 'users',
            'wakanda.tech': 'atom',
            'arkreactor.net': 'bolt',
            'google.com': 'search',
            'github.com': 'code-branch',
            'youtube.com': 'youtube',
            'developer.mozilla.org': 'firefox',
            'stackoverflow.com': 'stack-overflow'
        };
        
        return iconMap[domain] || 'globe';
    }
    
    function addWebsite() {
        const name = newWebsiteName.value.trim();
        const url = newWebsiteUrl.value.trim();
        
        if (!name || !url) {
            logToConsole('> ERROR: PLEASE PROVIDE BOTH NAME AND URL.', 'error');
            return;
        }
        
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            logToConsole('> ERROR: INVALID URL FORMAT (INCLUDE HTTPS://).', 'error');
            return;
        }
        
        const newWebsite = { name, url };
        websites.push(newWebsite);
        saveWebsites();
        renderWebsites();
        
        // Clear inputs
        newWebsiteName.value = '';
        newWebsiteUrl.value = '';
        
        logToConsole(`> NEW ENTRY ADDED TO DIRECTORY: ${name}`, 'success');
    }
    
    function deleteWebsite(index) {
        const deletedWebsite = websites[index];
        websites.splice(index, 1);
        saveWebsites();
        renderWebsites(searchInput.value);
        logToConsole(`> ENTRY REMOVED FROM DIRECTORY: ${deletedWebsite.name}`, 'warning');
    }
    
    function filterWebsites() {
        renderWebsites(searchInput.value);
    }
    
    function saveWebsites() {
        localStorage.setItem('jarvisWebsites', JSON.stringify(websites));
    }
    
    function logToConsole(message, type = 'info') {
        const messageElement = document.createElement('p');
        messageElement.textContent = `> ${message}`;
        
        switch(type) {
            case 'error':
                messageElement.classList.add('error');
                break;
            case 'success':
                messageElement.classList.add('success');
                break;
            case 'warning':
                messageElement.classList.add('warning');
                break;
        }
        
        consoleOutput.appendChild(messageElement);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    
    function clearConsole() {
        consoleOutput.innerHTML = '';
        logToConsole('CONSOLE CLEARED.');
    }
    
    function toggleConsole() {
        consoleElement.classList.toggle('collapsed');
    }
    
    function openLoginModal() {
        loginModal.style.display = 'block';
        usernameInput.focus();
    }
    
    function loginAdmin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            isAdminLoggedIn = true;
            loginModal.style.display = 'none';
            adminBtn.innerHTML = '<i class="fas fa-user-shield"></i><span>LOGOUT</span>';
            addWebsiteForm.classList.remove('hidden');
            renderWebsites();
            logToConsole('> ADMIN ACCESS GRANTED. WELCOME, SIR.', 'success');
            loginSound.currentTime = 0;
            loginSound.volume = 0.3;
            loginSound.play().catch(e => console.log('Audio play error:', e));
        } else {
            loginError.textContent = 'ACCESS DENIED: INVALID CREDENTIALS';
            deniedSound.currentTime = 0;
            deniedSound.volume = 0.3;
            deniedSound.play().catch(e => console.log('Audio play error:', e));
        }
    }
    
    function logoutAdmin() {
        isAdminLoggedIn = false;
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i><span>ADMIN</span>';
        addWebsiteForm.classList.add('hidden');
        renderWebsites();
        logToConsole('> ADMIN SESSION TERMINATED.', 'warning');
    }
    
    // Prevent form submission
    document.querySelector('.add-website').addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // Create holographic particle effect
    function createParticles() {
        const particlesContainer = document.querySelector('.particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 10 + 5;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    createParticles();
});
