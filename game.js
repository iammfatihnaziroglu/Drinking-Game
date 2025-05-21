// Oyun durumu
const gameState = {
    player1Score: 0,
    player2Score: 0,
    currentRound: 0,
    totalRounds: 10,
    isRoundActive: false,
    targetShownAt: null,
    waitDelay: 0,
    lastWinner: null,
    gameTimer: null,
    timeRemaining: 30,
    player1Stars: 0,
    player2Stars: 0,
    modeThreshold: 3000,  // Her kaç puanda bir mod değişimi olacak
    grayscaleMode: false, // Siyah-beyaz mod durumu
    lastModeThresholdPassed: 0 // Son geçilen eşik
};

// Oyun konfigürasyonu
const gameConfig = {
    minWaitTime: 1000,  // ms
    maxWaitTime: 3000,  // ms
    targetSize: {
        min: 60,        // px - daha büyük minimum boyut
        max: 90         // px - daha büyük maksimum boyut
    },
    trapSize: {
        min: 50,        // px
        max: 70         // px
    },
    roundDelay: 1000,   // ms
    starThreshold: 5000, // Her kaç puanda bir yıldız verileceği
    gameDuration: 30,    // Oyun süresi (saniye)
    missClickPenalty: 100, // Alan dışı tıklama cezası
    trapPenalty: 500,    // Tuzak butona tıklama cezası
    trapProbability: 0.15, // Tuzak buton oluşma olasılığı (0-1 arası)
    modeNotificationTime: 2000, // Mod değişim bildirimi gösterim süresi
    countdown: 3        // Başlangıç geri sayımı
};

// DOM elementleri
const elements = {
    target: document.getElementById('target'),
    messageDisplay: document.getElementById('message-display'),
    startButton: document.getElementById('start-game'),
    player1Score: document.getElementById('player1-score'),
    player2Score: document.getElementById('player2-score'),
    currentRound: document.getElementById('current-round'),
    totalRounds: document.getElementById('total-rounds'),
    gameArea: document.getElementById('game-area'),
    timer: document.getElementById('timer'),
    player1Stars: document.getElementById('player1-stars'),
    player2Stars: document.getElementById('player2-stars'),
    modeIndicator: document.getElementById('mode-indicator'),
    modeTransition: document.querySelector('.mode-transition')
};

// Oyunu başlatma
function startGame() {
    resetGame();
    
    // Reset button icon back to start symbol
    elements.startButton.textContent = "▶";
    elements.startButton.classList.remove("refresh-icon");
    elements.startButton.classList.add("start-icon");
    
    // Hide the button during gameplay with fade out
    elements.startButton.style.opacity = "0";
    setTimeout(() => {
        elements.startButton.style.display = "none";
    }, 300); // Wait for fade animation to complete
    
    updateDisplay();
    startGameCountdown(); // Geri sayım ile başlat
}

// Oyunu geri sayımla başlat
function startGameCountdown() {
    // Geri sayım değerini ayarla
    let countdown = gameConfig.countdown;
    
    // Başlangıç mesajını göster
    showMessage(`${countdown}`);
    
    // Geri sayımı başlat
    const countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdown > 0) {
            // Geri sayımı güncelle
            showMessage(`${countdown}`);
        } else {
            // Geri sayım tamamlandığında
            clearInterval(countdownInterval);
            showMessage("Oyun Başlasın!");
            
            // Kısa bir süre sonra oyunu başlat
            setTimeout(() => {
                hideMessage();
                gameState.currentRound = 1;
                startRound();
                startTimer();
            }, 1000);
        }
    }, 1000);
}

// Zamanlayıcıyı başlat
function startTimer() {
    gameState.timeRemaining = gameConfig.gameDuration;
    updateTimer();
    
    gameState.gameTimer = setInterval(() => {
        gameState.timeRemaining--;
        updateTimer();
        
        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

// Zamanlayıcıyı güncelle
function updateTimer() {
    elements.timer.textContent = gameState.timeRemaining;
    
    if (gameState.timeRemaining <= 5) {
        elements.timer.classList.add('warning');
    } else {
        elements.timer.classList.remove('warning');
    }
}

// Oyunu bitir
function endGame() {
    clearInterval(gameState.gameTimer);
    hideTarget();
    
    // Ensure the button is displayed for game results
    elements.startButton.style.display = "flex";
    // Trigger reflow to ensure the transition works
    elements.startButton.offsetWidth;
    // Fade in
    elements.startButton.style.opacity = "1";
    
    showGameResults();
}

// Oyunu sıfırlama
function resetGame() {
    gameState.player1Score = 0;
    gameState.player2Score = 0;
    gameState.currentRound = 0;
    gameState.isRoundActive = false;
    gameState.targetShownAt = null;
    gameState.lastWinner = null;
    gameState.player1Stars = 0;
    gameState.player2Stars = 0;
    gameState.timeRemaining = gameConfig.gameDuration;
    gameState.grayscaleMode = false;
    gameState.lastModeThresholdPassed = 0;
    
    // Siyah-beyaz modu sıfırla
    setGrayscaleMode(false);
    
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
    }
    
    // Reset the button state
    elements.startButton.style.opacity = "1";
    elements.startButton.style.display = "flex";
    
    elements.totalRounds.textContent = gameState.totalRounds;
    elements.player1Stars.textContent = '';
    elements.player2Stars.textContent = '';
    elements.timer.style.color = '#333';
    hideTarget();
}

// Yeni tur başlatma
function startRound() {
    gameState.currentRound++;
    gameState.isRoundActive = true;
    
    // Her iki oyuncu için hedef oluştur
    createTargetForPlayer(1);
    createTargetForPlayer(2);
    
    // Sadece rastgele aralıklarla tuzak butonları oluştur (her turda değil)
    // Her 3 turda bir tuzak çıkma olasılığını kontrol et
    if (gameState.currentRound % 3 === 0) {
        if (Math.random() < gameConfig.trapProbability) {
            // Hangi oyuncu için tuzak oluşacak? Rastgele seç
            const playerForTrap = Math.random() < 0.5 ? 1 : 2;
            createTrapForPlayer(playerForTrap);
        }
    }
    
    hideMessage();
    updateDisplay();
    
    gameState.targetShownAt = performance.now();
}

// Hedef gösterme
function showTarget() {
    if (!gameState.isRoundActive) {
        // Her oyuncu için ayrı hedef oluştur
        createTargetForPlayer(1);
        createTargetForPlayer(2);
        
        hideMessage();
        gameState.targetShownAt = performance.now();
        gameState.isRoundActive = true;
        gameState.player1Hit = false;
        gameState.player2Hit = false;
    }
}

// Oyuncu için hedef oluşturma
function createTargetForPlayer(player) {
    const playerArea = document.getElementById(`player${player}-area`);
    const areaRect = playerArea.getBoundingClientRect();
    const targetSize = Math.random() * 
        (gameConfig.targetSize.max - gameConfig.targetSize.min) + 
        gameConfig.targetSize.min;
    
    // Yeni hedef elementi oluştur
    const target = document.createElement('div');
    target.className = 'target';
    target.id = `target-player${player}`;
    
    // Define safe zones to prevent targets from appearing behind score displays
    const safeMargin = 100; // Safe margin from the sides with score displays
    
    // Calculate available area for target (excluding the score display areas)
    let targetX;
    if (player === 1) {
        // Player 1 - avoid left side
        targetX = safeMargin + Math.random() * (areaRect.width - safeMargin - targetSize);
    } else {
        // Player 2 - avoid right side
        const maxX = areaRect.width - safeMargin - targetSize;
        targetX = Math.random() * maxX;
    }
    
    const targetY = Math.random() * (areaRect.height - targetSize * 1.5) + targetSize/2;
    
    // Hedefi konumlandır ve boyutlandır
    target.style.width = `${targetSize}px`;
    target.style.height = `${targetSize}px`;
    target.style.left = `${targetX}px`;
    target.style.top = `${targetY}px`;
    
    // Eski hedef varsa kaldır
    const oldTarget = document.getElementById(`target-player${player}`);
    if (oldTarget) {
        oldTarget.remove();
    }
    
    // Yeni hedefi ekle
    playerArea.appendChild(target);
}

// Tuzak buton oluşturma
function createTrapForPlayer(player) {
    const playerArea = document.getElementById(`player${player}-area`);
    const areaRect = playerArea.getBoundingClientRect();
    const trapSize = Math.random() * 
        (gameConfig.trapSize.max - gameConfig.trapSize.min) + 
        gameConfig.trapSize.min;
    
    // Yeni tuzak elementi oluştur
    const trap = document.createElement('div');
    trap.className = 'trap';
    trap.id = `trap-player${player}`;
    
    // Define safe zones to prevent traps from appearing behind score displays
    const safeMargin = 100; // Safe margin from the sides with score displays
    
    // Calculate available area for trap (excluding the score display areas)
    let trapX;
    if (player === 1) {
        // Player 1 - avoid left side
        trapX = safeMargin + Math.random() * (areaRect.width - safeMargin - trapSize);
    } else {
        // Player 2 - avoid right side
        const maxX = areaRect.width - safeMargin - trapSize;
        trapX = Math.random() * maxX;
    }
    
    const trapY = Math.random() * (areaRect.height - trapSize * 1.5) + trapSize/2;
    
    // Tuzağı konumlandır ve boyutlandır
    trap.style.width = `${trapSize}px`;
    trap.style.height = `${trapSize}px`;
    trap.style.left = `${trapX}px`;
    trap.style.top = `${trapY}px`;
    
    // Eski tuzak varsa kaldır
    const oldTrap = document.getElementById(`trap-player${player}`);
    if (oldTrap) {
        oldTrap.remove();
    }
    
    // Yeni tuzağı ekle
    playerArea.appendChild(trap);
}

// Hedefi gizleme
function hideTarget() {
    const target1 = document.getElementById('target-player1');
    const target2 = document.getElementById('target-player2');
    const trap1 = document.getElementById('trap-player1');
    const trap2 = document.getElementById('trap-player2');
    
    if (target1) target1.remove();
    if (target2) target2.remove();
    if (trap1) trap1.remove();
    if (trap2) trap2.remove();
}

// Dokunma olayını işleme
function handleTouch(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Hangi oyuncu dokundu?
    const player = (touchX < window.innerWidth / 2) ? 1 : 2;
    
    // Oyuncunun alanını kontrol et
    const playerArea = document.getElementById(`player${player}-area`);
    const areaRect = playerArea.getBoundingClientRect();
    
    // Dokunuş oyuncunun kendi alanında mı?
    if (touchX < areaRect.left || touchX > areaRect.right ||
        touchY < areaRect.top || touchY > areaRect.bottom) {
        // Alan dışı dokunuş cezası
        penalizePlayer(player, gameConfig.missClickPenalty);
        showFeedback(false, player);
        return;
    }
    
    // Tuzak kontrolü
    const trap = document.getElementById(`trap-player${player}`);
    if (trap) {
        const trapRect = trap.getBoundingClientRect();
        if (isElementHit(touchX, touchY, trapRect)) {
            // Tuzağa tıklandı - daha büyük ceza
            penalizePlayer(player, gameConfig.trapPenalty);
            showFeedback(false, player, true); // True = trap feedback
            trap.remove();
            
            // Bir tuzağa tıkladıktan sonra nadiren yeni tuzak oluştur
            // (yani genellikle tuzak bitsin)
            if (Math.random() < 0.05) { // Sadece %5 olasılık
                setTimeout(() => {
                    createTrapForPlayer(player);
                }, 1000);
            }
            return;
        }
    }
    
    const target = document.getElementById(`target-player${player}`);
    if (!target) return;
    
    const targetRect = target.getBoundingClientRect();
    
    // Dokunma hedef üzerinde mi?
    if (isElementHit(touchX, touchY, targetRect)) {
        const reactionTime = performance.now() - gameState.targetShownAt;
        awardPoints(player, reactionTime);
        showFeedback(true, player);
        
        // Hedefi kaldır ve yenisini oluştur
        target.remove();
        
        // Yeni hedef için yeni zaman damgası
        gameState.targetShownAt = performance.now();
        createTargetForPlayer(player);
        
        // Çok düşük bir olasılıkla yeni tuzak oluştur (normal vuruşlardan sonra)
        // Her 10 hedefte bir tuzak gelme şansını kontrol et
        if (Math.random() < gameConfig.trapProbability / 3) {
            createTrapForPlayer(player);
        }
        
        // Skoru güncelle
        updateDisplay();
        
        // Tur kontrolü
        if (gameState.currentRound >= gameState.totalRounds) {
            const otherPlayer = player === 1 ? 2 : 1;
            const otherTarget = document.getElementById(`target-player${otherPlayer}`);
            const otherTrap = document.getElementById(`trap-player${otherPlayer}`);
            if (otherTarget) otherTarget.remove();
            if (otherTrap) otherTrap.remove();
            showGameResults();
            return;
        }
    } else {
        // Hedefi ıskaladı
        penalizePlayer(player, gameConfig.missClickPenalty);
        showFeedback(false, player);
    }
}

// Element vuruş kontrolü - hedefler ve tuzaklar için ortak fonksiyon
function isElementHit(x, y, elementRect) {
    const centerX = elementRect.left + elementRect.width / 2;
    const centerY = elementRect.top + elementRect.height / 2;
    const radius = elementRect.width / 2;
    
    const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + 
        Math.pow(y - centerY, 2)
    );
    
    return distance <= radius;
}

// Hedef vuruş kontrolü
function isTargetHit(x, y, target) {
    return isElementHit(x, y, target);
}

// Puan verme
function awardPoints(player, reactionTime) {
    // Reaksiyon süresine göre puan hesaplama (max 1000 puan)
    const points = Math.max(1000 - Math.floor(reactionTime), 100);
    
    // Önceki toplam puan
    const prevTotalScore = gameState.player1Score + gameState.player2Score;
    
    // Puanı güncelle
    if (player === 1) {
        gameState.player1Score += points;
    } else {
        gameState.player2Score += points;
    }
    
    // Yeni toplam puan
    const newTotalScore = gameState.player1Score + gameState.player2Score;
    
    // Mod değişim eşiğini geçti mi kontrol et
    const prevModeThresholdPassed = Math.floor(prevTotalScore / gameState.modeThreshold);
    const newModeThresholdPassed = Math.floor(newTotalScore / gameState.modeThreshold);
    
    // Eşik geçildi mi?
    if (newModeThresholdPassed > prevModeThresholdPassed) {
        // Son geçilen eşiği güncelle
        gameState.lastModeThresholdPassed = newModeThresholdPassed;
        
        // Siyah-beyaz mod ile normal mod arasında geçiş yap
        toggleGameMode();
    }
    
    // Yıldız kontrolü
    checkAndAwardStar(player);
    
    gameState.lastWinner = player;
}

// Yıldız kontrolü ve verme
function checkAndAwardStar(player) {
    const score = player === 1 ? gameState.player1Score : gameState.player2Score;
    const previousStars = player === 1 ? gameState.player1Stars : gameState.player2Stars;
    const newStars = Math.floor(score / gameConfig.starThreshold);
    
    if (newStars > previousStars) {
        if (player === 1) {
            gameState.player1Stars = newStars;
            animateStarGain(elements.player1Stars, newStars);
        } else {
            gameState.player2Stars = newStars;
            animateStarGain(elements.player2Stars, newStars);
        }
    }
}

// Ceza puanı
function penalizePlayer(player, penalty = 200) {
    if (player === 1) {
        gameState.player1Score = Math.max(0, gameState.player1Score - penalty);
    } else {
        gameState.player2Score = Math.max(0, gameState.player2Score - penalty);
    }
    updateDisplay();
}

// Görsel geri bildirim
function showFeedback(success, player, isTrap = false) {
    const playerArea = document.getElementById(`player${player}-area`);
    let intensity;
    let color;
    
    if (success) {
        // Başarılı vuruş
        intensity = '0.2';
        color = 'rgba(0, 255, 0, ' + intensity + ')';
    } else if (isTrap) {
        // Tuzak vuruşu - daha güçlü negatif feedback
        intensity = '0.5';
        color = 'rgba(255, 0, 0, ' + intensity + ')';
    } else {
        // Normal başarısız vuruş
        intensity = '0.3';
        color = 'rgba(255, 0, 0, ' + intensity + ')';
    }
    
    // Bölge arka plan rengi değişimi
    playerArea.style.backgroundColor = color;
    
    setTimeout(() => {
        playerArea.style.backgroundColor = player === 1 ? 
            'var(--player1-light)' : 
            'var(--player2-light)';
    }, isTrap ? 400 : 200); // Tuzak için daha uzun süre göster
    
    // Vuruş animasyonu
    if (success) {
        createHitAnimation(player, event);
    } else if (isTrap) {
        createTrapHitAnimation(player, event);
    }
}

// Vuruş animasyonu
function createHitAnimation(player, event) {
    const touch = event.touches[0];
    const hitEffect = document.createElement('div');
    hitEffect.className = 'hit-animation';
    
    // Renk belirleme
    hitEffect.style.background = player === 1 ? 
        'radial-gradient(circle, rgba(67, 97, 238, 0.7) 0%, rgba(67, 97, 238, 0) 70%)' : 
        'radial-gradient(circle, rgba(247, 37, 133, 0.7) 0%, rgba(247, 37, 133, 0) 70%)';
    
    // Konum ve boyut
    hitEffect.style.width = '50px';
    hitEffect.style.height = '50px';
    hitEffect.style.left = `${touch.clientX - 25}px`;
    hitEffect.style.top = `${touch.clientY - 25}px`;
    
    document.body.appendChild(hitEffect);
    
    // Animasyon tamamlandığında elementi kaldır
    setTimeout(() => {
        hitEffect.remove();
    }, 500);
}

// Tuzak vuruş animasyonu
function createTrapHitAnimation(player, event) {
    const touch = event.touches[0];
    const hitEffect = document.createElement('div');
    hitEffect.className = 'trap-hit-animation';
    
    // Renk belirleme
    hitEffect.style.background = 
        'radial-gradient(circle, rgba(255, 0, 0, 0.8) 0%, rgba(255, 0, 0, 0) 70%)';
    
    // Konum ve boyut
    hitEffect.style.width = '70px';
    hitEffect.style.height = '70px';
    hitEffect.style.left = `${touch.clientX - 35}px`;
    hitEffect.style.top = `${touch.clientY - 35}px`;
    
    document.body.appendChild(hitEffect);
    
    // Animasyon tamamlandığında elementi kaldır
    setTimeout(() => {
        hitEffect.remove();
    }, 700);
}

// Tur sonlandırma
function endRound() {
    gameState.isRoundActive = false;
    gameState.targetShownAt = null;
    hideTarget();
    updateDisplay();
    
    if (gameState.currentRound < gameState.totalRounds) {
        setTimeout(startRound, gameConfig.roundDelay);
    } else {
        showGameResults();
    }
}

// Oyun sonuçlarını gösterme
function showGameResults() {
    const winner = gameState.player1Score > gameState.player2Score ? 1 : 
                  gameState.player1Score < gameState.player2Score ? 2 : 0;
    
    let message = winner === 0 ? 
        "Berabere!" : 
        `Oyuncu ${winner} Kazandı!`;
    
    message += `\nSkor: ${gameState.player1Score} - ${gameState.player2Score}`;
    message += `\nYıldızlar: ${gameState.player1Stars} - ${gameState.player2Stars}`;
    showMessage(message);
    
    // Show the button again with refresh icon
    elements.startButton.style.display = "flex";
    elements.startButton.textContent = "↻";
    elements.startButton.classList.remove("start-icon");
    elements.startButton.classList.add("refresh-icon");
    
    // Trigger reflow to ensure the transition works
    elements.startButton.offsetWidth;
    
    // Fade in the button
    elements.startButton.style.opacity = "1";
    
    gameState.isRoundActive = false;
}

// Ekranı güncelleme
function updateDisplay() {
    elements.player1Score.textContent = gameState.player1Score;
    elements.player2Score.textContent = gameState.player2Score;
    elements.currentRound.textContent = gameState.currentRound;
}

// Mesaj gösterme
function showMessage(text) {
    elements.messageDisplay.textContent = text;
    elements.messageDisplay.style.opacity = '0';
    
    // Geri sayım veya başlangıç mesajı için sınıf ekle
    elements.messageDisplay.classList.remove('countdown', 'game-start');
    
    if (text === "1" || text === "2" || text === "3") {
        elements.messageDisplay.classList.add('countdown');
    } else if (text === "Oyun Başlasın!") {
        elements.messageDisplay.classList.add('game-start');
    }
    
    elements.messageDisplay.style.display = 'block';
    
    // Fade-in animasyonu
    setTimeout(() => {
        elements.messageDisplay.style.opacity = '1';
        elements.messageDisplay.style.transition = 'opacity 0.3s ease';
    }, 10);
}

// Mesaj gizleme
function hideMessage() {
    // Fade-out animasyonu
    elements.messageDisplay.style.opacity = '0';
    
    setTimeout(() => {
        elements.messageDisplay.style.display = 'none';
    }, 300);
}

// RAF ile hassas zamanlama
function preciseTimeout(callback, delay) {
    const start = performance.now();
    
    function check(timestamp) {
        const elapsed = timestamp - start;
        
        if (elapsed >= delay) {
            callback();
            return;
        }
        
        requestAnimationFrame(check);
    }
    
    requestAnimationFrame(check);
}

// Event listener'ları
elements.startButton.addEventListener('click', startGame);
elements.gameArea.addEventListener('touchstart', handleTouch, { passive: false });
elements.gameArea.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// Varsayılan davranışları engelle
document.addEventListener('contextmenu', e => e.preventDefault());

// Yıldız kazanma animasyonu
function animateStarGain(starElement, count) {
    starElement.textContent = '';
    
    // Her yıldızı sırayla ekle
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const starSpan = document.createElement('span');
            starSpan.textContent = '⭐';
            starSpan.style.opacity = '0';
            starSpan.style.transform = 'scale(0)';
            starSpan.style.transition = 'all 0.3s ease';
            starSpan.style.display = 'block';
            starElement.appendChild(starSpan);
            
            setTimeout(() => {
                starSpan.style.opacity = '1';
                starSpan.style.transform = 'scale(1)';
            }, 50);
        }, i * 200);
    }
}

// Oyun modunu değiştir
function toggleGameMode() {
    // Aktif modu tersine çevir
    const newMode = !gameState.grayscaleMode;
    
    // Geçiş efektini göster
    elements.modeTransition.classList.add('active');
    
    // Geçiş tamamlandıktan sonra modu değiştir
    setTimeout(() => {
        setGrayscaleMode(newMode);
        elements.modeTransition.classList.remove('active');
        
        // Mod göstergesini göster
        showModeIndicator(newMode);
    }, 500);
}

// Siyah-beyaz modu ayarla
function setGrayscaleMode(active) {
    gameState.grayscaleMode = active;
    
    if (active) {
        document.body.classList.add('grayscale-mode');
        elements.modeIndicator.textContent = 'Siyah Beyaz Mod';
    } else {
        document.body.classList.remove('grayscale-mode');
        elements.modeIndicator.textContent = 'Renkli Mod';
    }
}

// Mod göstergesini göster
function showModeIndicator(isGrayscale) {
    elements.modeIndicator.textContent = isGrayscale ? 'Siyah Beyaz Moda Geçildi' : 'Renkli Moda Geçildi';
    elements.modeIndicator.classList.add('visible');
    
    // Belirli bir süre sonra göstergeyi gizle
    setTimeout(() => {
        elements.modeIndicator.classList.remove('visible');
    }, gameConfig.modeNotificationTime);
} 