// src/features/dice/engine/diceAudio.js

class DiceAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.lastImpactTime = 0;
    }

    // مقداردهی اولیه به محض اولین تعامل کاربر (حل محدودیت Autoplay مرورگرها)
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
    }

    /**
     * صدای پرتاب اولیه تاس‌ها (صدای غلتش و سایش نرم رزین در دست و رها شدن)
     */
    playThrow(diceCount = 1) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const count = Math.min(Math.max(diceCount, 1), 6);
        const now = this.ctx.currentTime;

        // ۱. نویز سایش نمدی/پوستی در هنگام پرتاب
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + 0.22);
        filter.Q.setValueAtTime(2.2, now);

        const gain = this.ctx.createGain();
        const baseVol = Math.min(0.18 + count * 0.05, 0.42);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(baseVol, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.28);

        // ۲. تله‌کلیک‌های ریز اولیه به هم خوردن تاس‌ها در لحظه رهاسازی (Micro-rattles)
        const rattleCount = Math.min(count * 2, 5);
        for (let r = 0; r < rattleCount; r++) {
            const delay = 0.02 + Math.random() * 0.12;
            const rattleOsc = this.ctx.createOscillator();
            const rattleGain = this.ctx.createGain();

            rattleOsc.type = 'sine';
            rattleOsc.frequency.setValueAtTime(1800 + Math.random() * 800, now + delay);

            rattleGain.gain.setValueAtTime(0.08 * (0.5 + Math.random() * 0.5), now + delay);
            rattleGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.025);

            rattleOsc.connect(rattleGain);
            rattleGain.connect(this.ctx.destination);

            rattleOsc.start(now + delay);
            rattleOsc.stop(now + delay + 0.03);
        }
    }

    /**
     * صدای برخورد ASMR چندلایه‌ای سنگین رزین با نمد و چوب صیقلی
     * شدت صدا متناسب با سرعت فیزیکی است
     */
    playImpact(intensity = 0.5) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // جلوگیری از تداخل بیش از حد صدا در برخوردهای فوق سریع
        if (now - this.lastImpactTime < 0.025) return;
        this.lastImpactTime = now;

        const clampedIntensity = Math.min(Math.max(intensity, 0.15), 1.0);

        // لایه ۱: کوبش بم و مخملی میز چوبی/سینی نمدی (Heavy Velvet Sub-Thud)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        const subFreq = 95 + (Math.random() - 0.5) * 20;

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(subFreq, now);
        subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.075);

        const subVol = clampedIntensity * 0.48;
        subGain.gain.setValueAtTime(subVol, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.085);

        // لایه ۲: صدای بدنه متراکم رزین سنگ مرمر (Dense Resin Body Resonance)
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        const bodyFreq = 380 + (Math.random() - 0.5) * 70;

        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(bodyFreq, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(bodyFreq * 0.55, now + 0.05);

        const bodyVol = clampedIntensity * 0.32;
        bodyGain.gain.setValueAtTime(bodyVol, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.06);

        // لایه ۳: تقه کریستالی شفاف و گوش‌نواز (Crisp ASMR Ceramic Snap)
        const snapSize = Math.floor(this.ctx.sampleRate * 0.035);
        const snapBuffer = this.ctx.createBuffer(1, snapSize, this.ctx.sampleRate);
        const snapData = snapBuffer.getChannelData(0);

        for (let i = 0; i < snapSize; i++) {
            // میرایی بسیار سریع برای ترنزینت فوق‌العاده تیز و تمیز
            snapData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / snapSize, 4.5);
        }

        const snapSource = this.ctx.createBufferSource();
        snapSource.buffer = snapBuffer;

        const snapFilter = this.ctx.createBiquadFilter();
        snapFilter.type = 'bandpass';
        const snapCenterFreq = 3100 + (Math.random() - 0.5) * 500;
        snapFilter.frequency.setValueAtTime(snapCenterFreq, now);
        snapFilter.Q.setValueAtTime(4.5, now);

        const snapGain = this.ctx.createGain();
        const snapVol = clampedIntensity * 0.38;
        snapGain.gain.setValueAtTime(snapVol, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        snapSource.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(this.ctx.destination);

        snapSource.start(now);
        snapSource.stop(now + 0.038);
    }
}

export const diceAudio = new DiceAudioEngine();