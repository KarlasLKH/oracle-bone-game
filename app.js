// Oracle Bone Character Booth Game - Enhanced Version
class OracleBoneGame {
    constructor() {
        this.images = [];
        this.imageNames = [];
        this.currentImageIndex = -1;
        this.currentImageSrc = null;
        this.defaultImages = [
            { 
                name: 'oracle1.png', 
                url: 'https://pplx-res.cloudinary.com/image/upload/v1752807440/pplx_project_search_images/ffd78b5863216c814d6c81e56e7ec318ab688b93.jpg'
            },
            { 
                name: 'oracle2.png', 
                url: 'https://pplx-res.cloudinary.com/image/upload/v1752807441/pplx_project_search_images/dffa6ee79b21374586ab7e2c50304996c1e6084e.jpg'
            },
            { 
                name: 'oracle3.png', 
                url: 'https://pplx-res.cloudinary.com/image/upload/v1752807442/pplx_project_search_images/53c4cc7db2ba2661d6e59726f02d606fa07853dc.jpg'
            }
        ];
        
        this.countdownInterval = null;
        this.currentView = 'qr';
        this.gameStartedFrom = 'qr';
        this.storageKey = 'oracleBoneGameImages';
        
        // Initialize immediately without waiting for DOM
        this.initializeElements();
        this.init();
    }
    
    initializeElements() {
        this.elements = {
            qrSection: document.getElementById('qrSection'),
            gameSetup: document.getElementById('gameSetup'),
            gameEntry: document.getElementById('gameEntry'),
            instructionsSection: document.getElementById('instructionsSection'),
            gameScreen: document.getElementById('gameScreen'),
            qrCode: document.getElementById('qrCode'),
            imageTableBody: document.getElementById('imageTableBody'),
            imageCount: document.getElementById('imageCount'),
            imageInput: document.getElementById('imageInput'),
            showSetupBtn: document.getElementById('showSetupBtn'),
            showInstructionsBtn: document.getElementById('showInstructionsBtn'),
            backToQRFromInstructions: document.getElementById('backToQRFromInstructions'),
            qrStartGameBtn: document.getElementById('qrStartGameBtn'),
            startGameBtn: document.getElementById('startGameBtn'),
            playerStartGameBtn: document.getElementById('playerStartGameBtn'),
            playerInstructionsBtn: document.getElementById('playerInstructionsBtn'),
            backToQRBtn: document.getElementById('backToQRBtn'),
            gameStatus: document.getElementById('gameStatus'),
            gameImage: document.getElementById('gameImage'),
            countdown: document.getElementById('countdown'),
            blackScreen: document.getElementById('blackScreen'),
            backToEntryBtn: document.getElementById('backToEntryBtn'),
            imageDisplay: document.getElementById('imageDisplay'),
            replayBtn: document.getElementById('replayBtn'),
            newGameBtn: document.getElementById('newGameBtn')
        };
    }
    
    init() {
        console.log('Initializing Oracle Bone Game...');
        this.loadStoredImages();
        this.detectViewMode();
        this.bindEvents();
        this.updateUI();
        this.generateQRCode();
        this.showSyncStatus('已載入圖片庫');
        console.log('Oracle Bone Game initialized successfully');
    }
    
    detectViewMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'player') {
            this.showGameEntry();
        } else {
            this.showQRSection();
        }
    }
    
    loadStoredImages() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                this.images = parsed.images || [];
                this.imageNames = parsed.names || [];
                console.log('Loaded stored images:', this.images.length);
            }
        } catch (e) {
            console.error('Error loading stored images:', e);
        }
        
        // Ensure we have at least the default images
        if (this.images.length === 0) {
            this.loadDefaultImages();
        }
    }
    
    loadDefaultImages() {
        this.images = [];
        this.imageNames = [];
        this.defaultImages.forEach(img => {
            this.images.push(img.url);
            this.imageNames.push(img.name);
        });
        this.saveToStorage();
        console.log('Loaded default images:', this.images.length);
    }
    
    saveToStorage() {
        try {
            const dataToStore = {
                images: this.images,
                names: this.imageNames,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
            console.log('Saved to storage:', this.images.length, 'images');
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
    
    showSyncStatus(message, type = 'success') {
        let statusEl = document.getElementById('syncStatus');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'syncStatus';
            statusEl.className = 'sync-status';
            statusEl.innerHTML = `
                <div class="sync-icon"></div>
                <span class="sync-message"></span>
            `;
            document.body.appendChild(statusEl);
        }
        
        const messageEl = statusEl.querySelector('.sync-message');
        const iconEl = statusEl.querySelector('.sync-icon');
        
        if (messageEl) messageEl.textContent = message;
        if (iconEl) iconEl.className = `sync-icon ${type === 'syncing' ? 'syncing' : ''}`;
        statusEl.classList.add('active');
        
        setTimeout(() => {
            statusEl.classList.remove('active');
        }, 2000);
    }
    
    generateQRCode() {
        const qrContainer = this.elements.qrCode;
        if (!qrContainer) return;
        
        const gameURL = `https://karlaslkh.github.io/oracle-bone-game/?mode=player`;
        console.log('Generating QR code for:', gameURL);
        
        qrContainer.innerHTML = '';
        
        // Try to use QRCode.js library if available
        if (typeof QRCode !== 'undefined') {
            try {
                QRCode.toCanvas(qrContainer, gameURL, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#134252',
                        light: '#FFFFFF'
                    },
                    errorCorrectionLevel: 'M'
                }, (error) => {
                    if (error) {
                        console.error('QR Code generation error:', error);
                        this.showQRAPIFallback(qrContainer, gameURL);
                    } else {
                        console.log('QR Code generated successfully');
                    }
                });
            } catch (error) {
                console.error('QR Code generation error:', error);
                this.showQRAPIFallback(qrContainer, gameURL);
            }
        } else {
            // Fallback to QR code API
            this.showQRAPIFallback(qrContainer, gameURL);
        }
    }
    
    showQRAPIFallback(container, gameURL) {
        console.log('Using QR API fallback');
        const qrSize = 200;
        const qrAPI = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(gameURL)}&format=png&margin=10`;
        
        const qrImg = document.createElement('img');
        qrImg.src = qrAPI;
        qrImg.alt = 'QR Code for Game';
        qrImg.style.width = '100%';
        qrImg.style.height = '100%';
        qrImg.style.objectFit = 'contain';
        qrImg.style.borderRadius = '8px';
        
        qrImg.onerror = () => {
            console.log('QR API failed, showing fallback');
            this.showQRFallback(container, gameURL);
        };
        
        container.appendChild(qrImg);
    }
    
    showQRFallback(container, gameURL) {
        container.innerHTML = `
            <div class="qr-fallback">
                <div class="fallback-icon">📱</div>
                <div class="fallback-text">
                    QR Code<br>
                    暫時無法生成<br>
                    <br>
                    <small>請直接使用以下連結：<br>
                    <a href="${gameURL}" target="_blank" style="color: var(--color-primary); word-break: break-all; font-size: 10px;">
                        ${gameURL}
                    </a></small>
                </div>
            </div>
        `;
    }
    
    showQRSection() {
        console.log('Showing QR Section');
        this.currentView = 'qr';
        this.hideAllSections();
        if (this.elements.qrSection) {
            this.elements.qrSection.style.display = 'flex';
        }
    }
    
    showInstructions() {
        console.log('Showing Instructions');
        this.currentView = 'instructions';
        this.hideAllSections();
        if (this.elements.instructionsSection) {
            this.elements.instructionsSection.style.display = 'block';
        }
    }
    
    showGameSetup() {
        console.log('Showing Game Setup');
        this.currentView = 'setup';
        this.hideAllSections();
        if (this.elements.gameSetup) {
            this.elements.gameSetup.style.display = 'block';
        }
        this.updateUI();
    }
    
    showGameEntry() {
        console.log('Showing Game Entry');
        this.currentView = 'entry';
        this.hideAllSections();
        if (this.elements.gameEntry) {
            this.elements.gameEntry.style.display = 'flex';
        }
    }
    
    hideAllSections() {
        const sections = [
            this.elements.qrSection,
            this.elements.gameSetup,
            this.elements.gameEntry,
            this.elements.instructionsSection
        ];
        
        sections.forEach(section => {
            if (section) {
                section.style.display = 'none';
            }
        });
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Navigation buttons
        this.bindEvent('showSetupBtn', () => {
            console.log('Show setup button clicked');
            this.showGameSetup();
        });
        
        this.bindEvent('showInstructionsBtn', () => {
            console.log('Show instructions button clicked');
            this.showInstructions();
        });
        
        this.bindEvent('backToQRFromInstructions', () => {
            console.log('Back to QR from instructions clicked');
            this.showQRSection();
        });
        
        this.bindEvent('playerInstructionsBtn', () => {
            console.log('Player instructions button clicked');
            this.showInstructions();
        });
        
        this.bindEvent('qrStartGameBtn', () => {
            console.log('QR start game button clicked');
            this.gameStartedFrom = 'qr';
            this.startGame();
        });
        
        this.bindEvent('backToQRBtn', () => {
            console.log('Back to QR button clicked');
            this.showQRSection();
        });
        
        // File upload
        this.bindEvent('imageInput', (e) => {
            console.log('Image input changed');
            this.handleImageUpload(e);
        }, 'change');
        
        // Game controls
        this.bindEvent('startGameBtn', () => {
            console.log('Start game button clicked');
            this.gameStartedFrom = 'setup';
            this.startGame();
        });
        
        this.bindEvent('playerStartGameBtn', () => {
            console.log('Player start game button clicked');
            this.gameStartedFrom = 'entry';
            this.startGame();
        });
        
        this.bindEvent('backToEntryBtn', () => {
            console.log('Back to entry button clicked');
            this.returnToEntry();
        });
        
        // New game control buttons
        this.bindEvent('replayBtn', () => {
            console.log('Replay button clicked');
            this.replayCurrentImage();
        });
        
        this.bindEvent('newGameBtn', () => {
            console.log('New game button clicked');
            this.startGame();
        });
        
        console.log('Events bound successfully');
    }
    
    bindEvent(elementId, handler, eventType = 'click') {
        const element = this.elements[elementId];
        if (element) {
            element.addEventListener(eventType, (e) => {
                e.preventDefault();
                handler(e);
            });
            console.log(`Bound ${eventType} event to ${elementId}`);
        } else {
            console.warn(`Element ${elementId} not found for event binding`);
        }
    }
    
    handleImageUpload(event) {
        const files = Array.from(event.target.files);
        console.log('Uploading images:', files.length);
        this.showSyncStatus('正在上傳圖片...', 'syncing');
        
        let processedCount = 0;
        const totalFiles = files.length;
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.images.push(e.target.result);
                    this.imageNames.push(file.name);
                    processedCount++;
                    
                    if (processedCount === totalFiles) {
                        this.saveToStorage();
                        this.updateUI();
                        this.showSyncStatus(`已上傳 ${totalFiles} 張圖片`);
                        this.generateQRCode();
                    }
                };
                reader.readAsDataURL(file);
            } else {
                processedCount++;
                if (processedCount === totalFiles) {
                    this.saveToStorage();
                    this.updateUI();
                    this.showSyncStatus(`已上傳 ${totalFiles} 張圖片`);
                }
            }
        });
        
        event.target.value = '';
    }
    
    removeImage(index) {
        const imageToRemove = this.images[index];
        
        if (imageToRemove && imageToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove);
        }
        
        this.images.splice(index, 1);
        this.imageNames.splice(index, 1);
        this.saveToStorage();
        this.updateUI();
        this.showSyncStatus('已刪除圖片');
        this.generateQRCode();
    }
    
    updateUI() {
        this.updateImageTable();
        this.updateImageCount();
        this.updateGameStatus();
    }
    
    updateImageTable() {
        if (!this.elements.imageTableBody) return;
        
        const tbody = this.elements.imageTableBody;
        tbody.innerHTML = '';
        
        this.imageNames.forEach((imageName, index) => {
            const row = document.createElement('tr');
            
            const indexCell = document.createElement('td');
            indexCell.className = 'index';
            indexCell.textContent = index + 1;
            
            const nameCell = document.createElement('td');
            nameCell.className = 'filename';
            nameCell.textContent = imageName;
            nameCell.title = imageName;
            
            const actionCell = document.createElement('td');
            actionCell.className = 'actions';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '刪除';
            removeBtn.setAttribute('aria-label', `刪除 ${imageName}`);
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeImage(index);
            });
            
            actionCell.appendChild(removeBtn);
            
            row.appendChild(indexCell);
            row.appendChild(nameCell);
            row.appendChild(actionCell);
            
            tbody.appendChild(row);
        });
    }
    
    updateImageCount() {
        if (!this.elements.imageCount) return;
        
        const count = this.images.length;
        this.elements.imageCount.textContent = `${count} 張圖片`;
    }
    
    updateGameStatus() {
        if (!this.elements.gameStatus) return;
        
        const statusElement = this.elements.gameStatus;
        const messageElement = statusElement.querySelector('.status-message');
        const startBtn = this.elements.startGameBtn;
        
        if (this.images.length === 0) {
            if (messageElement) messageElement.textContent = '請上傳至少一張圖片';
            statusElement.classList.add('warning');
            if (startBtn) startBtn.disabled = true;
        } else {
            if (messageElement) messageElement.textContent = '準備開始遊戲';
            statusElement.classList.remove('warning');
            if (startBtn) startBtn.disabled = false;
        }
    }
    
    startGame() {
        console.log('Starting game...');
        if (this.images.length === 0) {
            alert('請先上傳圖片才能開始遊戲');
            return;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        const randomIndex = Math.floor(Math.random() * this.images.length);
        this.currentImageIndex = randomIndex;
        this.currentImageSrc = this.images[randomIndex];
        
        console.log('Selected image:', this.currentImageIndex, this.imageNames[randomIndex]);
        this.displayImage();
    }
    
    replayCurrentImage() {
        console.log('Replaying current image');
        if (this.currentImageSrc) {
            this.displayImage();
        }
    }
    
    displayImage() {
        console.log('Displaying image');
        this.hideAllSections();
        
        if (this.elements.gameScreen) {
            this.elements.gameScreen.classList.add('active');
        }
        document.body.classList.add('game-active');
        
        // Reset display states
        if (this.elements.imageDisplay) {
            this.elements.imageDisplay.style.display = 'flex';
        }
        if (this.elements.blackScreen) {
            this.elements.blackScreen.classList.remove('active');
        }
        
        // Set the image
        if (this.elements.gameImage) {
            this.elements.gameImage.src = this.currentImageSrc;
        }
        
        // Start countdown
        this.startCountdown();
    }
    
    startCountdown() {
        console.log('Starting countdown');
        let timeLeft = 5;
        if (this.elements.countdown) {
            this.elements.countdown.textContent = timeLeft;
            this.elements.countdown.style.display = 'flex';
        }
        
        this.countdownInterval = setInterval(() => {
            timeLeft--;
            if (this.elements.countdown) {
                this.elements.countdown.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                this.showBlackScreen();
            }
        }, 1000);
    }
    
    showBlackScreen() {
        console.log('Showing black screen');
        if (this.elements.imageDisplay) {
            this.elements.imageDisplay.style.display = 'none';
        }
        if (this.elements.blackScreen) {
            this.elements.blackScreen.classList.add('active');
        }
    }
    
    returnToEntry() {
        console.log('Returning to entry');
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        if (this.elements.gameScreen) {
            this.elements.gameScreen.classList.remove('active');
        }
        document.body.classList.remove('game-active');
        
        // Reset game screen states
        if (this.elements.blackScreen) {
            this.elements.blackScreen.classList.remove('active');
        }
        if (this.elements.imageDisplay) {
            this.elements.imageDisplay.style.display = 'flex';
        }
        if (this.elements.countdown) {
            this.elements.countdown.style.display = 'flex';
        }
        
        // Clear the game image
        if (this.elements.gameImage) {
            this.elements.gameImage.src = '';
        }
        
        // Return to the appropriate view
        if (this.gameStartedFrom === 'qr') {
            this.showQRSection();
        } else if (this.gameStartedFrom === 'setup') {
            this.showGameSetup();
        } else if (this.gameStartedFrom === 'entry') {
            this.showGameEntry();
        } else {
            this.showQRSection();
        }
    }
    
    cleanup() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.images.forEach(imageSrc => {
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc);
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game');
    const game = new OracleBoneGame();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        game.cleanup();
    });
    
    // Make game instance available globally
    window.oracleBoneGame = game;
});

// Prevent accidental navigation during game
window.addEventListener('beforeunload', (event) => {
    if (document.body.classList.contains('game-active')) {
        event.preventDefault();
        event.returnValue = '';
    }
});
