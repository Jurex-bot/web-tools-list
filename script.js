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
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const adminBtn = document.getElementById('adminBtn');
    const closeModal = document.querySelector('.close-modal');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    
    // Admin credentials (in a real app, this would be server-side)
    const ADMIN_CREDENTIALS = {
        username: "admin",
        password: "jarvis123"
    };
    
    // Sample websites data
    let websites = [
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'YouTube', url: 'https://www.youtube.com' },
        { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
        { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
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
    const interactiveElements = document.querySelectorAll('button, .website-item, .power-button, .close-modal');
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
        logToConsole('> System boot sequence initiated...');
        setTimeout(() => {
            logToConsole('> Loading core modules...');
        }, 1000);
        setTimeout(() => {
            logToConsole('> Establishing network connections...');
        }, 2000);
        setTimeout(() => {
            logToConsole('> Initializing user interface...');
        }, 3000);
        setTimeout(() => {
            logToConsole('> System ready.');
            powerOn();
        }, 4000);
    }
    
    function powerOn() {
        isPoweredOn = true;
        powerBtn.classList.remove('off');
        document.querySelector('.light.green').classList.add('active');
        
        setTimeout(() => {
            welcomeMessage.classList.add('hidden');
            directoryContainer.classList.remove('hidden');
            setTimeout(() => {
                directoryContainer.classList.add('visible');
                renderWebsites();
            }, 100);
        }, 8500); // After typing animations complete
    }
    
    function togglePower() {
        if (isPoweredOn) {
            // Power off
            isPoweredOn = false;
            powerBtn.classList.add('off');
            document.querySelector('.light.green').classList.remove('active');
            welcomeMessage.classList.remove('hidden');
            directoryContainer.classList.remove('visible');
            setTimeout(() => {
                directoryContainer.classList.add('hidden');
            }, 500);
            logToConsole('> System shutdown initiated...');
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
            websiteList.innerHTML = '<p class="no-results">No websites found matching your search.</p>';
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
                    logToConsole(`> Opening ${website.name}...`);
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
            'google.com': 'search',
            'github.com': 'code-branch',
            'youtube.com': 'youtube',
            'developer.mozilla.org': 'firefox',
            'stackoverflow.com': 'stack-overflow',
            'twitter.com': 'twitter',
            'facebook.com': 'facebook',
            'instagram.com': 'instagram',
            'linkedin.com': 'linkedin',
            'reddit.com': 'reddit',
            'amazon.com': 'amazon',
            'netflix.com': 'tv',
            'spotify.com': 'spotify'
        };
        
        return iconMap[domain] || 'globe';
    }
    
    function addWebsite() {
        const name = newWebsiteName.value.trim();
        const url = newWebsiteUrl.value.trim();
        
        if (!name || !url) {
            logToConsole('> Error: Please provide both name and URL.', 'error');
            return;
        }
        
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            logToConsole('> Error: Please enter a valid URL (include http:// or https://).', 'error');
            return;
        }
        
        const newWebsite = { name, url };
        websites.push(newWebsite);
        saveWebsites();
        renderWebsites();
        
        // Clear inputs
        newWebsiteName.value = '';
        newWebsiteUrl.value = '';
        
        logToConsole(`> Added new website: ${name}`);
    }
    
    function deleteWebsite(index) {
        const deletedWebsite = websites[index];
        websites.splice(index, 1);
        saveWebsites();
        renderWebsites(searchInput.value);
        logToConsole(`> Deleted website: ${deletedWebsite.name}`);
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
        
        if (type === 'error') {
            messageElement.style.color = 'var(--error-color)';
        } else if (type === 'success') {
            messageElement.style.color = 'var(--accent-color)';
        }
        
        consoleOutput.appendChild(messageElement);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    
    function clearConsole() {
        consoleOutput.innerHTML = '';
        logToConsole('Console cleared.');
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
            adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> Logout';
            addWebsiteForm.classList.remove('hidden');
            renderWebsites();
            logToConsole('> Admin logged in successfully.', 'success');
        } else {
            loginError.textContent = 'Invalid username or password';
        }
    }
    
    function logoutAdmin() {
        isAdminLoggedIn = false;
        adminBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
        addWebsiteForm.classList.add('hidden');
        renderWebsites();
        logToConsole('> Admin logged out.');
    }
    
    // Prevent form submission
    document.querySelector('.add-website').addEventListener('submit', function(e) {
        e.preventDefault();
    });
});
