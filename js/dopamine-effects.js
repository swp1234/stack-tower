// Stack Tower - Dopamine Enhancement Effects Module
// Particle effects, screen shake, floating text, visual feedback

class DopamineEffects {
  static createConfetti(ctx, x, y, count = 20, color = '#FFD700') {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 4 + Math.random() * 4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        maxLife: 1,
        size: 4 + Math.random() * 4,
        color: color,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2
      });
    }
    return particles;
  }

  static createSparkles(ctx, x, y, count = 15, color = '#00FF88') {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.6,
        size: 2 + Math.random() * 3,
        color: color,
        isSparkle: true
      });
    }
    return particles;
  }

  static createGoldBurst(x, y, count = 25) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 3 + Math.random() * 5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        maxLife: 0.8,
        size: 3 + Math.random() * 5,
        color: '#FFD700',
        glow: true
      });
    }
    return particles;
  }

  static createPulse(ctx, x, y, maxRadius = 80, color = '#00FF00', duration = 0.4) {
    return {
      x: x,
      y: y,
      radius: 0,
      maxRadius: maxRadius,
      life: 1,
      maxLife: duration,
      color: color,
      isPulse: true
    };
  }

  static createComboText(text, x, y, color = '#FFD700', size = 24) {
    return {
      text: text,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: -3 - Math.random() * 2,
      life: 1,
      maxLife: 1.2,
      color: color,
      size: size,
      isText: true
    };
  }

  static updateParticles(particles, deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Decay life
      p.life -= deltaTime / p.maxLife;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Physics
      if (!p.isText && !p.isPulse) {
        p.vx *= 0.99;
        p.vy += 0.15; // gravity
        p.x += p.vx;
        p.y += p.vy;
        if (p.rotation !== undefined) {
          p.rotation += p.spin || 0.05;
        }
      } else if (p.isText) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // subtle gravity
      }
    }
  }

  static drawParticles(ctx, particles, scale, offsetX, offsetY) {
    particles.forEach(p => {
      const sx = p.x * scale + offsetX;
      const sy = p.y * scale + offsetY;
      const alpha = p.life;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);

      if (p.isPulse) {
        // Expanding ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const r = p.radius + (p.maxRadius - p.radius) * (1 - p.life);
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.isText) {
        // Floating text
        ctx.font = `bold ${Math.round(p.size)}px Arial`;
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text, sx, sy);
      } else if (p.isSparkle) {
        // Star sparkle
        const size = p.size * alpha;
        ctx.fillStyle = p.color;
        ctx.filter = `drop-shadow(0 0 ${3 * alpha}px ${p.color})`;
        ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const angle = (Math.PI / 2) * j;
          const x = sx + Math.cos(angle) * size;
          const y = sy + Math.sin(angle) * size;
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.glow) {
        // Glowing sphere
        ctx.fillStyle = p.color;
        ctx.filter = `drop-shadow(0 0 ${8 * alpha}px ${p.color})`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Regular particle
        ctx.fillStyle = p.color;
        ctx.save();
        if (p.rotation !== undefined) {
          ctx.translate(sx, sy);
          ctx.rotate(p.rotation);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();
    });
  }

  static applyScreenShake(shakeAmount) {
    // Returns offset object for shake effect
    if (shakeAmount <= 0) return { x: 0, y: 0 };

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * shakeAmount;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  }

  static createFlashEffect(targetAlpha = 0.3, duration = 0.2) {
    return {
      alpha: targetAlpha,
      duration: duration,
      elapsed: 0
    };
  }
}

// Exported effects for use in game
class FloatingText {
  constructor(text, x, y, color = '#FFD700') {
    this.particles = [DopamineEffects.createComboText(text, x, y, color, 28)];
  }

  update(deltaTime) {
    DopamineEffects.updateParticles(this.particles, deltaTime * 1000);
  }

  isDone() {
    return this.particles.length === 0;
  }

  draw(ctx, scale, offsetX, offsetY) {
    DopamineEffects.drawParticles(ctx, this.particles, scale, offsetX, offsetY);
  }
}

class ParticleBurst {
  constructor(x, y, type = 'confetti', color = '#FFD700') {
    this.particles = [];

    switch(type) {
      case 'confetti':
        this.particles = DopamineEffects.createConfetti(null, x, y, 25, color);
        break;
      case 'sparkle':
        this.particles = DopamineEffects.createSparkles(null, x, y, 20, color);
        break;
      case 'gold':
        this.particles = DopamineEffects.createGoldBurst(x, y, 30);
        break;
      default:
        this.particles = DopamineEffects.createConfetti(null, x, y, 20, color);
    }

    // Add pulse ring
    this.pulse = DopamineEffects.createPulse(null, x, y, 60, color);
    this.particles.push(this.pulse);
  }

  update(deltaTime) {
    DopamineEffects.updateParticles(this.particles, deltaTime * 1000);
  }

  isDone() {
    return this.particles.length === 0;
  }

  draw(ctx, scale, offsetX, offsetY) {
    DopamineEffects.drawParticles(ctx, this.particles, scale, offsetX, offsetY);
  }
}

// Screen Flash effect for visual feedback
class ScreenFlash {
  constructor(color = 'rgba(255,255,255,0.3)', duration = 0.2) {
    this.color = color;
    this.duration = duration;
    this.elapsed = 0;
  }

  update(deltaTime) {
    this.elapsed += deltaTime;
  }

  isDone() {
    return this.elapsed >= this.duration;
  }

  draw(ctx, width, height) {
    const alpha = 1 - (this.elapsed / this.duration);
    ctx.fillStyle = this.color.replace('0.3', alpha * 0.3);
    ctx.fillRect(0, 0, width, height);
  }
}
