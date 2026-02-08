// Stack Tower - Complete Game Engine
// 2026 Design: Canvas-based timing arcade

class StackTowerGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Logical size
    this.W = 400;
    this.H = 700;

    // Game state
    this.state = 'menu'; // menu, ready, playing, falling, gameover
    this.screen = 'main'; // main, game, gameOver, skin, leaderboard

    // Blocks
    this.stack = [];
    this.movingBlock = null;
    this.fallingPiece = null; // trimmed-off piece
    this.floor = 0;
    this.score = 0;
    this.perfectCount = 0;
    this.perfectStreak = 0;
    this.bestStreak = 0;
    this.combo = 0;

    // Speed
    this.baseSpeed = 2.5;
    this.speed = this.baseSpeed;
    this.direction = 1;

    // Camera
    this.cameraY = 0;
    this.targetCameraY = 0;

    // Visual effects
    this.particles = [];
    this.bgParticles = [];
    this.feedbackText = null;
    this.shakeAmount = 0;
    this.flashAlpha = 0;

    // Power-ups
    this.reviveUsed = false;
    this.slowActive = false;
    this.slowTimer = 0;
    this.hintActive = false;
    this.hintTimer = 0;

    // Theme
    this.currentTheme = 'classic';
    this.unlockedThemes = ['classic'];

    // Stats
    this.stats = {
      maxFloor: 0,
      maxScore: 0,
      totalGames: 0,
      totalFloors: 0,
      totalPerfects: 0,
      bestStreak: 0
    };

    // Ad tracking
    this.playCount = 0;

    // Badges
    this.unlockedBadges = [];

    this.loadData();
    this.setupCanvas();
    this.setupEvents();
    this.setupUI();
    this.updateMainUI();

    // Start render loop
    this.lastTime = 0;
    requestAnimationFrame((t) => this.loop(t));
  }

  // === DATA ===
  loadData() {
    try {
      const d = JSON.parse(localStorage.getItem('stackTower_v2'));
      if (d) {
        this.stats = { ...this.stats, ...d.stats };
        this.currentTheme = d.theme || 'classic';
        this.unlockedThemes = d.unlockedThemes || ['classic'];
        this.unlockedBadges = d.unlockedBadges || [];
      }
    } catch (e) { /* ignore */ }
    this.checkThemeUnlocks();
  }

  saveData() {
    localStorage.setItem('stackTower_v2', JSON.stringify({
      stats: this.stats,
      theme: this.currentTheme,
      unlockedThemes: this.unlockedThemes,
      unlockedBadges: this.unlockedBadges
    }));
  }

  // === CANVAS ===
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Maintain aspect ratio
    let w = rect.width;
    let h = rect.height;

    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;

    // Scale factor from logical to physical
    this.scaleX = (w * dpr) / this.W;
    this.scaleY = (h * dpr) / this.H;
    this.scale = Math.min(this.scaleX, this.scaleY);
    this.offsetX = (w * dpr - this.W * this.scale) / 2;
    this.offsetY = (h * dpr - this.H * this.scale) / 2;
  }

  // === EVENTS ===
  setupEvents() {
    const tap = (e) => {
      e.preventDefault();
      this.handleTap();
    };
    this.canvas.addEventListener('touchstart', tap, { passive: false });
    this.canvas.addEventListener('mousedown', tap);

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowDown') {
        e.preventDefault();
        this.handleTap();
      }
    });
  }

  handleTap() {
    if (this.state === 'ready') {
      this.state = 'playing';
      const hint = document.getElementById('tap-hint');
      if (hint) hint.style.display = 'none';
      return;
    }

    if (this.state === 'playing') {
      this.dropBlock();
    }
  }

  // === GAME LOGIC ===
  startGame() {
    this.state = 'ready';
    this.screen = 'game';
    this.floor = 0;
    this.score = 0;
    this.perfectCount = 0;
    this.perfectStreak = 0;
    this.bestStreak = 0;
    this.combo = 0;
    this.stack = [];
    this.movingBlock = null;
    this.fallingPiece = null;
    this.particles = [];
    this.feedbackText = null;
    this.initBgParticles();
    this.cameraY = 0;
    this.targetCameraY = 0;
    this.reviveUsed = false;
    this.slowActive = false;
    this.hintActive = false;
    this.speed = this.baseSpeed;
    this.direction = 1;
    this.shakeAmount = 0;

    // Create foundation block
    const blockW = 160;
    const blockH = 28;
    const baseY = this.H - 80;
    this.stack.push({
      x: (this.W - blockW) / 2,
      y: baseY,
      w: blockW,
      h: blockH,
      color: this.getBlockColor(0)
    });
    this.floor = 0;

    // Create first moving block
    this.spawnMovingBlock();

    this.updateScreen();
    this.updateHUD();

    // Resize canvas after screen transition
    setTimeout(() => this.resizeCanvas(), 50);

    const hint = document.getElementById('tap-hint');
    if (hint) hint.style.display = 'block';
  }

  getBlockColor(index) {
    const theme = THEMES_DATA.find(t => t.id === this.currentTheme) || THEMES_DATA[0];
    return theme.colors[index % theme.colors.length];
  }

  getTheme() {
    return THEMES_DATA.find(t => t.id === this.currentTheme) || THEMES_DATA[0];
  }

  spawnMovingBlock() {
    const top = this.stack[this.stack.length - 1];
    const blockH = 28;
    const y = top.y - blockH - 2;

    this.movingBlock = {
      x: 0,
      y: y,
      w: top.w,
      h: blockH,
      color: this.getBlockColor(this.stack.length),
      moving: true,
      vy: 0
    };

    // Alternate direction
    this.direction = this.stack.length % 2 === 0 ? 1 : -1;
    this.movingBlock.x = this.direction === 1 ? -this.movingBlock.w : this.W;

    // Increase speed
    const speedLevel = Math.floor(this.floor / 5);
    this.speed = Math.min(this.baseSpeed + speedLevel * 0.3, 8);

    // Update camera target
    if (this.stack.length > 6) {
      this.targetCameraY = -(y - this.H * 0.4);
    }
  }

  dropBlock() {
    if (!this.movingBlock || !this.movingBlock.moving) return;
    this.movingBlock.moving = false;
    this.state = 'falling';
    if (window.sfx) window.sfx.place();

    // Calculate overlap with top of stack
    const prev = this.stack[this.stack.length - 1];
    const curr = this.movingBlock;

    const overlapLeft = Math.max(prev.x, curr.x);
    const overlapRight = Math.min(prev.x + prev.w, curr.x + curr.w);
    const overlapW = overlapRight - overlapLeft;

    if (overlapW <= 0) {
      // Complete miss
      this.fallingPiece = { ...curr, vy: 0 };
      this.movingBlock = null;
      this.triggerGameOver();
      return;
    }

    const offset = Math.abs((curr.x + curr.w / 2) - (prev.x + prev.w / 2));

    // Perfect check
    if (offset <= 5) {
      // PERFECT - snap to previous block position
      curr.x = prev.x;
      curr.w = prev.w;
      this.combo++;
      this.perfectCount++;
      this.perfectStreak++;
      this.bestStreak = Math.max(this.bestStreak, this.perfectStreak);
      this.score += 50 + this.combo * 10;

      if (window.sfx) window.sfx.perfect();
      this.spawnParticles(curr.x + curr.w / 2, curr.y + curr.h / 2, '#2ecc71', 30);
      this.showFeedback('PERFECT!', '#2ecc71');
      this.shakeAmount = 8;
      this.flashAlpha = 0.25;
      curr.whiteBorderFlash = 0.4;

      // Grow block slightly on consecutive perfects
      if (this.combo >= 3) {
        if (window.sfx) window.sfx.combo(this.combo);
        const growth = Math.min(this.combo * 2, 20);
        const maxW = 200;
        const newW = Math.min(curr.w + growth, maxW);
        const diff = newW - curr.w;
        curr.x -= diff / 2;
        curr.w = newW;
        if (curr.x < 0) { curr.x = 0; }
        if (curr.x + curr.w > this.W) { curr.x = this.W - curr.w; }
      }
    } else {
      // Trim the block
      this.combo = 0;
      this.perfectStreak = 0;

      // Create falling trimmed piece
      if (curr.x < prev.x) {
        // Excess on the left
        const excessW = prev.x - curr.x;
        this.fallingPiece = {
          x: curr.x, y: curr.y, w: excessW, h: curr.h,
          color: curr.color, vy: 0
        };
        curr.x = overlapLeft;
        curr.w = overlapW;
      } else if (curr.x + curr.w > prev.x + prev.w) {
        // Excess on the right
        const excessX = prev.x + prev.w;
        const excessW = (curr.x + curr.w) - excessX;
        this.fallingPiece = {
          x: excessX, y: curr.y, w: excessW, h: curr.h,
          color: curr.color, vy: 0
        };
        curr.w = overlapW;
        curr.x = overlapLeft;
      } else {
        curr.x = overlapLeft;
        curr.w = overlapW;
      }

      if (offset <= 15) {
        this.showFeedback('GOOD', '#f39c12');
      }

      this.score += 10;
    }

    // Floor bonus every 10 floors
    this.floor++;
    this.stats.totalFloors++;
    if (this.floor % 10 === 0) {
      this.score += 100;
      this.showFeedback(`+100 BONUS`, '#ffd700');
    }

    // Check min width
    if (curr.w < 12) {
      this.stack.push(curr);
      this.movingBlock = null;
      this.triggerGameOver();
      return;
    }

    // Land the block
    this.stack.push(curr);
    this.movingBlock = null;

    // Squash effect
    curr.squash = 1;

    // Next block after short delay
    setTimeout(() => {
      if (this.state === 'falling' || this.state === 'playing') {
        this.state = 'playing';
        this.spawnMovingBlock();
        this.updateHUD();
      }
    }, 100);
  }

  triggerGameOver() {
    this.state = 'gameover';
    this.playCount++;
    if (window.sfx) window.sfx.gameOver();
    this.stats.totalGames++;
    this.stats.totalPerfects += this.perfectCount;
    this.stats.bestStreak = Math.max(this.stats.bestStreak, this.bestStreak);

    const isNewBest = this.floor > this.stats.maxFloor;
    this.stats.maxFloor = Math.max(this.stats.maxFloor, this.floor);
    this.stats.maxScore = Math.max(this.stats.maxScore, this.score);

    this.checkThemeUnlocks();
    this.checkBadges();
    this.saveData();

    // Show game over after delay
    setTimeout(() => {
      this.screen = 'gameOver';
      this.updateScreen();
      this.updateGameOverUI(isNewBest);

      // Interstitial ad every 3 games
      if (this.playCount % 3 === 0) {
        this.showInterstitialAd();
      }
    }, 800);
  }

  reviveGame() {
    if (this.reviveUsed) return;
    this.reviveUsed = true;

    // Show ad first
    this.showInterstitialAd(() => {
      // Restore last block width
      if (this.stack.length > 0) {
        const last = this.stack[this.stack.length - 1];
        last.w = Math.max(last.w, 60);
      }

      this.state = 'playing';
      this.screen = 'game';
      this.updateScreen();
      this.spawnMovingBlock();
      this.updateHUD();
    });
  }

  // === POWER-UPS ===
  activateSlowMotion() {
    if (this.slowActive || this.state !== 'playing') return;
    this.showInterstitialAd(() => {
      this.slowActive = true;
      this.slowTimer = 300; // 5 seconds at 60fps
      this.showFeedback('SLOW MOTION!', '#9b59b6');
      if (typeof gtag === 'function') {
        gtag('event', 'use_powerup', { powerup_type: 'slow_motion', floor: this.floor });
      }
    });
  }

  activateHint() {
    if (this.hintActive || this.state !== 'playing') return;
    this.showInterstitialAd(() => {
      this.hintActive = true;
      this.hintTimer = 180; // 3 seconds
      this.showFeedback('HINT ON!', '#3498db');
      if (typeof gtag === 'function') {
        gtag('event', 'use_powerup', { powerup_type: 'hint', floor: this.floor });
      }
    });
  }

  // === BACKGROUND PARTICLES ===
  initBgParticles() {
    this.bgParticles = [];
    for (let i = 0; i < 40; i++) {
      this.bgParticles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: 0,
        vy: -0.3 - Math.random() * 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        size: Math.random() * 1.5 + 0.5
      });
    }
  }

  updateBgParticles(dt) {
    for (const p of this.bgParticles) {
      p.y += p.vy * dt;
      if (p.y < -10) {
        p.y = this.H + 10;
        p.x = Math.random() * this.W;
      }
    }
  }

  renderBgParticles(ctx) {
    for (const p of this.bgParticles) {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.5})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  // === RENDER LOOP ===
  loop(timestamp) {
    const dt = this.lastTime ? Math.min((timestamp - this.lastTime) / 16.67, 2) : 1;
    this.lastTime = timestamp;

    try { this.update(dt); this.render(); } catch(e) { console.error('Game loop error:', e); }
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.state === 'menu' || this.state === 'gameover') {
      // Only update particles
      this.updateParticles(dt);
      this.updateBgParticles(dt);
      return;
    }

    const speedMult = this.slowActive ? 0.4 : 1;

    // Move block
    if (this.movingBlock && this.movingBlock.moving) {
      this.movingBlock.x += this.speed * this.direction * dt * speedMult;

      // Bounce off edges
      if (this.movingBlock.x + this.movingBlock.w > this.W) {
        this.movingBlock.x = this.W - this.movingBlock.w;
        this.direction = -1;
      }
      if (this.movingBlock.x < 0) {
        this.movingBlock.x = 0;
        this.direction = 1;
      }
    }

    // Falling trimmed piece
    if (this.fallingPiece) {
      this.fallingPiece.vy += 0.5 * dt;
      this.fallingPiece.y += this.fallingPiece.vy * dt;
      if (this.fallingPiece.y > this.H + 100 - this.cameraY) {
        this.fallingPiece = null;
      }
    }

    // Camera interpolation
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.08 * dt;

    // Slow motion timer
    if (this.slowActive) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowActive = false;
      }
    }

    // Hint timer
    if (this.hintActive) {
      this.hintTimer -= dt;
      if (this.hintTimer <= 0) {
        this.hintActive = false;
      }
    }

    // Screen shake decay
    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.88;
      if (this.shakeAmount < 0.3) this.shakeAmount = 0;
    }

    // Flash decay
    if (this.flashAlpha > 0) {
      this.flashAlpha *= 0.92;
      if (this.flashAlpha < 0.01) this.flashAlpha = 0;
    }

    // Feedback text
    if (this.feedbackText) {
      this.feedbackText.life -= dt;
      this.feedbackText.y -= 0.5 * dt;
      if (this.feedbackText.life <= 0) this.feedbackText = null;
    }

    this.updateParticles(dt);
    this.updateBgParticles(dt);
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.15 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const W = this.W;
    const H = this.H;

    ctx.save();

    // Clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply scaling
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    if (this.state === 'menu') {
      ctx.restore();
      return;
    }

    const theme = this.getTheme();

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, theme.backgroundGradient ? theme.backgroundGradient[0] : theme.background);
    bgGrad.addColorStop(1, theme.backgroundGradient ? theme.backgroundGradient[1] : theme.background);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Stars for space theme
    if (theme.stars) {
      this.renderStars(ctx);
    }

    // Grid lines
    this.renderGrid(ctx, theme);

    // Floating ambient particles
    this.renderBgParticles(ctx);

    // Apply camera shake
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(sx, sy);
    }

    // Apply camera
    ctx.save();
    ctx.translate(0, this.cameraY);

    // Render stacked blocks
    for (let i = 0; i < this.stack.length; i++) {
      this.renderBlock(ctx, this.stack[i], theme, i);
    }

    // Render moving block
    if (this.movingBlock) {
      this.renderBlock(ctx, this.movingBlock, theme, this.stack.length);
    }

    // Render hint line
    if (this.hintActive && this.stack.length > 0) {
      const top = this.stack[this.stack.length - 1];
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(top.x, top.y - 40);
      ctx.lineTo(top.x, top.y - 5);
      ctx.moveTo(top.x + top.w, top.y - 40);
      ctx.lineTo(top.x + top.w, top.y - 5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Perfect zone highlight
      ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
      ctx.fillRect(top.x, top.y - 40, top.w, 35);
    }

    // Render falling piece
    if (this.fallingPiece) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = this.fallingPiece.color;
      ctx.fillRect(this.fallingPiece.x, this.fallingPiece.y, this.fallingPiece.w, this.fallingPiece.h);
      ctx.globalAlpha = 1;
    }

    // Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const size = p.size * alpha;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // camera

    // Feedback text (screen-space)
    if (this.feedbackText) {
      const ft = this.feedbackText;
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Shadow
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, W / 2, ft.y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Combo counter
    if (this.combo >= 2 && (this.state === 'playing' || this.state === 'falling')) {
      const baseFontSize = 16;
      const fontSize = Math.min(baseFontSize + Math.floor(this.combo / 5) * 2, 28);
      const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.08;

      ctx.save();
      ctx.translate(W / 2, 40);
      ctx.scale(pulseScale, pulseScale);

      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffd700';
      ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.combo}x COMBO`, 0, 0);

      ctx.restore();
    }

    // Flash overlay
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(46, 204, 113, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Slow motion indicator
    if (this.slowActive) {
      ctx.fillStyle = 'rgba(155, 89, 182, 0.15)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#9b59b6';
      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`⏱ SLOW (${Math.ceil(this.slowTimer / 60)}s)`, W / 2, H - 20);
    }

    ctx.restore();
  }

  renderBlock(ctx, block, theme, index) {
    const { x, y, w, h, color } = block;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 3, y + 3, w, h);

    // Main block
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, this.lightenColor(color, 20));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, this.darkenColor(color, 20));
    ctx.fillStyle = grad;

    // Neon glow (only for top block and moving block to save performance)
    if (theme.glowEffect && (block === this.stack[this.stack.length - 1] || block === this.movingBlock)) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
    }

    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // Inner glow overlay (semi-transparent white at top)
    const innerGlow = ctx.createLinearGradient(x, y, x, y + h * 0.3);
    innerGlow.addColorStop(0, 'rgba(255,255,255,0.25)');
    innerGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(x, y, w, h * 0.3);

    // Top highlight (thicker and brighter)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x, y, w, 5);

    // Left highlight
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(x, y, 2, h);

    // Bottom edge
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x, y + h - 2, w, 2);

    // Side shading (3D effect)
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(x + w - 2, y, 2, h);

    // White border flash on perfect
    if (block.whiteBorderFlash && block.whiteBorderFlash > 0) {
      const alpha = block.whiteBorderFlash;
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      block.whiteBorderFlash *= 0.85;
      if (block.whiteBorderFlash < 0.01) block.whiteBorderFlash = 0;
    }
  }

  renderStars(ctx) {
    for (let i = 0; i < 60; i++) {
      const sx = (i * 97 + 13) % this.W;
      const sy = ((i * 137 + 29 + this.cameraY * 0.2) % this.H);
      const size = 1 + (i % 3);
      const twinkle = 0.3 + Math.sin(Date.now() * 0.002 + i) * 0.2;
      ctx.fillStyle = `rgba(255,255,255,${0.5 + twinkle})`;
      ctx.fillRect(sx, sy, size, size);
    }
  }

  renderGrid(ctx, theme) {
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.H);
      ctx.stroke();
    }
    for (let y = 0; y < this.H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.W, y);
      ctx.stroke();
    }
  }

  // === EFFECTS ===
  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 4 + Math.random() * 4
      });
    }
  }

  showFeedback(text, color) {
    this.feedbackText = {
      text,
      color,
      y: this.H * 0.35,
      size: text === 'PERFECT!' ? 32 : 24,
      life: 50,
      maxLife: 50
    };

    // Update HUD combo display
    const hudCombo = document.getElementById('hud-combo');
    if (hudCombo) {
      hudCombo.textContent = text;
      hudCombo.style.color = color;
      hudCombo.classList.remove('hidden');
      clearTimeout(this._comboTimeout);
      this._comboTimeout = setTimeout(() => {
        hudCombo.classList.add('hidden');
      }, 800);
    }
  }

  // === UI ===
  setupUI() {
    // Main screen buttons
    document.getElementById('startBtn')?.addEventListener('click', () => this.startGame());
    document.getElementById('skinsBtn')?.addEventListener('click', () => this.showThemeScreen());
    document.getElementById('leaderboardBtn')?.addEventListener('click', () => this.showStatsScreen());

    // Game over buttons
    document.getElementById('reviveGameBtn')?.addEventListener('click', () => this.reviveGame());
    document.getElementById('restartBtn')?.addEventListener('click', () => this.startGame());
    document.getElementById('shareBtn')?.addEventListener('click', () => this.shareResult());
    document.getElementById('mainMenuBtn')?.addEventListener('click', () => this.showMainScreen());

    // Skin screen
    document.getElementById('skinBackBtn')?.addEventListener('click', () => this.showMainScreen());

    // Leaderboard screen
    document.getElementById('leaderboardBackBtn')?.addEventListener('click', () => this.showMainScreen());

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.dataset.tab;
        document.getElementById(tab + 'Content')?.classList.add('active');
      });
    });

    // Power-up buttons
    document.getElementById('slowBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.activateSlowMotion();
    });
    document.getElementById('hintBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.activateHint();
    });

    // Language change callback
    if (typeof i18n !== 'undefined') {
      i18n.onLanguageChange = () => {
        this.updateMainUI();
        if (this.screen === 'skin') this.renderThemeSelection();
        if (this.screen === 'leaderboard') {
          this.renderBadges();
          this.updateStatsDisplay();
        }
        if (this.screen === 'gameOver') this.updateGameOverUI(false);
      };
    }
  }

  updateScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const map = {
      main: 'mainScreen',
      game: 'gameScreen',
      gameOver: 'gameOverScreen',
      skin: 'skinScreen',
      leaderboard: 'leaderboardScreen'
    };
    const el = document.getElementById(map[this.screen]);
    if (el) el.classList.add('active');
  }

  updateMainUI() {
    const maxFloorEl = document.getElementById('maxFloor');
    const maxScoreEl = document.getElementById('maxScore');
    const badgeEl = document.getElementById('currentBadge');

    if (maxFloorEl) maxFloorEl.textContent = this.stats.maxFloor;
    if (maxScoreEl) maxScoreEl.textContent = this.stats.maxScore;
    if (badgeEl) {
      const badge = this.getCurrentTitle();
      badgeEl.textContent = `${badge.emoji} ${this.getLocalizedTitleName(badge)}`;
    }
  }

  updateHUD() {
    const floorEl = document.getElementById('floorDisplay');
    const scoreEl = document.getElementById('scoreDisplay');
    if (floorEl) floorEl.textContent = this.floor;
    if (scoreEl) scoreEl.textContent = this.score;
  }

  updateGameOverUI(isNewBest) {
    const floorEl = document.getElementById('finalFloor');
    const scoreEl = document.getElementById('finalScore');
    const perfectEl = document.getElementById('perfectCount');

    if (floorEl) floorEl.textContent = this._t('game.floorValue', { value: this.floor });
    if (scoreEl) scoreEl.textContent = this.score;
    if (perfectEl) perfectEl.textContent = this._t('game.perfectValue', { value: this.perfectCount });

    // Title at result
    const title = this.getCurrentTitle();
    const titleContainer = document.querySelector('.game-over-container .result-stats');
    if (titleContainer) {
      let titleEl = document.getElementById('resultTitle');
      if (!titleEl) {
        titleEl = document.createElement('div');
        titleEl.id = 'resultTitle';
        titleEl.style.cssText = 'grid-column: 1/-1; text-align:center; font-size:1.2rem; font-weight:700; color:#ffd700; padding-top:0.5rem;';
        titleContainer.appendChild(titleEl);
      }
      titleEl.textContent = `${title.emoji} ${this.getLocalizedTitleName(title)}`;
    }

    // New best indicator
    const newBestEl = document.querySelector('.game-over-container');
    if (newBestEl && isNewBest && this.floor > 0) {
      let bestTag = document.getElementById('newBestTag');
      if (!bestTag) {
        bestTag = document.createElement('div');
        bestTag.id = 'newBestTag';
        bestTag.style.cssText = 'text-align:center; color:#ffd700; font-size:1.1rem; font-weight:700; margin-bottom:1rem; animation: popIn 0.6s ease;';
        const title = newBestEl.querySelector('.game-over-title');
        if (title) title.after(bestTag);
      }
      bestTag.textContent = this._t('game.newBestRecord');
      bestTag.style.display = 'block';
    } else {
      const bestTag = document.getElementById('newBestTag');
      if (bestTag) bestTag.style.display = 'none';
    }

    // Hide revive if already used
    const reviveBtn = document.getElementById('reviveGameBtn');
    if (reviveBtn) {
      reviveBtn.style.display = this.reviveUsed ? 'none' : 'block';
    }
  }

  showMainScreen() {
    this.state = 'menu';
    this.screen = 'main';
    this.updateScreen();
    this.updateMainUI();
  }

  showThemeScreen() {
    this.screen = 'skin';
    this.updateScreen();
    this.renderThemeSelection();
  }

  showStatsScreen() {
    this.screen = 'leaderboard';
    this.updateScreen();
    this.renderBadges();
    this.updateStatsDisplay();
  }

  // === THEMES ===
  checkThemeUnlocks() {
    for (const theme of THEMES_DATA) {
      if (theme.unlockCondition === 'default') continue;
      if (this.stats.maxFloor >= theme.unlockFloor) {
        if (!this.unlockedThemes.includes(theme.id)) {
          this.unlockedThemes.push(theme.id);
        }
      }
    }
  }

  renderThemeSelection() {
    const grid = document.getElementById('skinGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (const theme of THEMES_DATA) {
      const isLocked = !this.unlockedThemes.includes(theme.id);
      const isSelected = theme.id === this.currentTheme;

      const card = document.createElement('div');
      card.className = `skin-card ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`;

      // Color preview strip
      const preview = document.createElement('div');
      preview.style.cssText = 'display:flex; gap:3px; margin-bottom:8px;';
      theme.colors.slice(0, 5).forEach(c => {
        const dot = document.createElement('div');
        dot.style.cssText = `width:24px; height:24px; border-radius:4px; background:${c};`;
        preview.appendChild(dot);
      });

      card.innerHTML = '';
      card.appendChild(preview);

      const nameDiv = document.createElement('div');
      nameDiv.className = 'skin-name';
      nameDiv.textContent = `${theme.emoji} ${this.getLocalizedThemeName(theme)}`;
      card.appendChild(nameDiv);

      if (isLocked) {
        const lockDiv = document.createElement('div');
        lockDiv.className = 'skin-unlock';
        lockDiv.textContent = this._t('skins.unlockReq', { floor: theme.unlockFloor });
        card.appendChild(lockDiv);
      } else if (isSelected) {
        const badge = document.createElement('div');
        badge.className = 'skin-badge';
        badge.textContent = this._t('skins.inUse');
        badge.style.color = '#2ecc71';
        card.appendChild(badge);
      }

      if (!isLocked) {
        card.addEventListener('click', () => {
          this.currentTheme = theme.id;
          this.saveData();
          this.renderThemeSelection();
        });
      }

      grid.appendChild(card);
    }
  }

  // === BADGES ===
  getCurrentTitle() {
    let current = TITLES_DATA[0];
    for (const t of TITLES_DATA) {
      if (this.stats.maxFloor >= t.floor) {
        current = t;
      }
    }
    return current;
  }

  checkBadges() {
    // Check floor badges
    for (const t of TITLES_DATA) {
      if (this.stats.maxFloor >= t.floor && !this.unlockedBadges.includes('floor_' + t.floor)) {
        this.unlockedBadges.push('floor_' + t.floor);
      }
    }
    // Check special badges
    for (const s of SPECIAL_TITLES) {
      if (s.condition === 'perfect_streak' && this.stats.bestStreak >= s.value) {
        if (!this.unlockedBadges.includes(s.id)) this.unlockedBadges.push(s.id);
      }
      if (s.condition === 'total_floors' && this.stats.totalFloors >= s.value) {
        if (!this.unlockedBadges.includes(s.id)) this.unlockedBadges.push(s.id);
      }
    }
  }

  renderBadges() {
    const list = document.getElementById('badgesList');
    if (!list) return;
    list.innerHTML = '';

    for (const t of TITLES_DATA) {
      const unlocked = this.unlockedBadges.includes('floor_' + t.floor);
      const item = document.createElement('div');
      item.className = `badge-item ${unlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="badge-icon">${unlocked ? t.emoji : '🔒'}</div>
        <div class="badge-item-name">${this.getLocalizedTitleName(t)}</div>
        <div class="badge-item-desc">${this._t('badges.floorDesc', { value: t.floor })}</div>
      `;
      list.appendChild(item);
    }

    // Special
    for (const s of SPECIAL_TITLES) {
      const unlocked = this.unlockedBadges.includes(s.id);
      const item = document.createElement('div');
      item.className = `badge-item ${unlocked ? 'unlocked' : ''}`;
      const desc = s.condition === 'perfect_streak'
        ? this._t('badges.perfectStreakDesc', { value: s.value })
        : this._t('badges.totalFloorsDesc', { value: s.value.toLocaleString() });
      item.innerHTML = `
        <div class="badge-icon">${unlocked ? s.emoji : '🔒'}</div>
        <div class="badge-item-name">${this.getLocalizedSpecialTitleName(s)}</div>
        <div class="badge-item-desc">${desc}</div>
      `;
      list.appendChild(item);
    }
  }

  updateStatsDisplay() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('totalGames', this.stats.totalGames);
    set('totalFloors', this.stats.totalFloors.toLocaleString());
    const avg = this.stats.totalGames > 0 ? Math.floor(this.stats.totalFloors / this.stats.totalGames) : 0;
    set('avgFloor', avg);
    set('perfectTotal', this.stats.totalPerfects);
  }

  // === SHARE ===
  shareResult() {
    const titleData = this.getCurrentTitle();
    const text = this._t('game.shareText', {
      floor: this.floor,
      emoji: titleData.emoji,
      title: this.getLocalizedTitleName(titleData),
      score: this.score,
      perfect: this.perfectCount
    });
    const url = 'https://dopabrain.com/stack-tower/';

    if (navigator.share) {
      navigator.share({ title: 'Stack Tower', text, url }).catch(() => {});
    } else {
      const copiedMsg = this._t('game.copiedToClipboard');
      const copyPrompt = this._t('game.copyPrompt');
      navigator.clipboard?.writeText(text + '\n' + url).then(() => {
        alert(copiedMsg);
      }).catch(() => {
        prompt(copyPrompt, text + '\n' + url);
      });
    }

    if (window.gtag) {
      gtag('event', 'share', { content_type: 'game_result', floor: this.floor, score: this.score });
    }
  }

  // === ADS ===
  showInterstitialAd(callback) {
    const overlay = document.getElementById('countdownContainer');
    if (!overlay) {
      if (callback) callback();
      return;
    }

    overlay.style.display = 'block';
    let count = 5;
    const countEl = document.getElementById('countdown');
    if (countEl) countEl.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (countEl) countEl.textContent = count;
      if (count <= 0) {
        clearInterval(interval);
        overlay.style.display = 'none';
        if (callback) callback();
      }
    }, 1000);
  }

  // === I18N HELPERS ===
  _t(key, vars) {
    return typeof i18n !== 'undefined' ? i18n.t(key, vars) : key;
  }

  getLocalizedTitleName(titleObj) {
    const key = 'titles.' + titleObj.floor;
    const val = this._t(key);
    return val !== key ? val : titleObj.name;
  }

  getLocalizedSpecialTitleName(specialObj) {
    const key = 'specialTitles.' + specialObj.id;
    const val = this._t(key);
    return val !== key ? val : specialObj.name;
  }

  getLocalizedThemeName(themeObj) {
    const key = 'themes.' + themeObj.id;
    const val = this._t(key);
    return val !== key ? val : themeObj.name;
  }

  // === COLOR UTILS ===
  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
    const b = Math.min(255, (num & 0x0000FF) + percent);
    return `rgb(${r},${g},${b})`;
  }

  darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - percent);
    const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
    const b = Math.max(0, (num & 0x0000FF) - percent);
    return `rgb(${r},${g},${b})`;
  }
}

// Initialize
const game = new StackTowerGame();

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Analytics
if (window.gtag) {
  gtag('event', 'page_view', { page_title: 'Stack Tower' });
}
