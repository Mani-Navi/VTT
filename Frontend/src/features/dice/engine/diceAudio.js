// src/features/dice/engine/diceAudio.js

class DiceAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.lastImpactTime = 0;
    }

    // مقداردهی اولیه به محض اولین تعامل کاربر (حل مشکل Autoplay مرورگرها)
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
     * صدای پرتاب اولیه تاس‌ها (صدای رها شدن در هوا)
     */
    playThrow(diceCount = 1) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const count = Math.min(Math.max(diceCount, 1), 6);
        const now = this.ctx.currentTime;

        // ایجاد یک زنجیره نویز فیلترشده برای شبیه‌سازی صدای تکان خوردن تاس‌ها در دست
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        const volume = Math.min(0.15 + count * 0.04, 0.45);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.25);
    }

    /**
     * صدای برخورد تاس با نمد، چوب و تاس‌های دیگر (Resin Impact)
     * شدت صدا بین 0.1 تا 1.0 متناسب با سرعت برخورد فیزیکی است
     */
    playImpact(intensity = 0.5) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // جلوگیری از اشباع صوتی (Throttle حداقل ۳۰ میلی‌ثانیه بین ضربه‌ها)
        if (now - this.lastImpactTime < 0.035) return;
        this.lastImpactTime = now;

        const clampedIntensity = Math.min(Math.max(intensity, 0.15), 1.0);

        // ۱. فرکانس بم نمد/چوب (Thud)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        // تغییر جزئی فرکانس برای اینکه هر برخورد صدای منحصر به فردی داشته باشد
        const randomFreq = 160 + (Math.random() - 0.5) * 40;
        osc.frequency.setValueAtTime(randomFreq, now);
        osc.frequency.exponentialRampToValueAtTime(randomFreq * 0.6, now + 0.06);

        const oscVol = clampedIntensity * 0.35;
        oscGain.gain.setValueAtTime(oscVol, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);

        // ۲. صدای تقه رزینی با فرکانس بالا (Resin Clack)
        const clickSize = Math.floor(this.ctx.sampleRate * 0.045);
        const clickBuffer = this.ctx.createBuffer(1, clickSize, this.ctx.sampleRate);
        const clickData = clickBuffer.getChannelData(0);

        for (let i = 0; i < clickSize; i++) {
            clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickSize * 0.25));
        }

        const clickSource = this.ctx.createBufferSource();
        clickSource.buffer = clickBuffer;

        const clickFilter = this.ctx.createBiquadFilter();
        clickFilter.type = 'bandpass';
        const clickFreq = 2200 + (Math.random() - 0.5) * 600;
        clickFilter.frequency.setValueAtTime(clickFreq, now);
        clickFilter.Q.setValueAtTime(4.0, now);

        const clickGain = this.ctx.createGain();
        const clickVol = clampedIntensity * 0.45;
        clickGain.gain.setValueAtTime(clickVol, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        clickSource.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickSource.start(now);
        clickSource.stop(now + 0.05);
    }
}

export const diceAudio = new DiceAudioEngine();