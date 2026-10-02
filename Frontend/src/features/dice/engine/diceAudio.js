// src/features/dice/engine/diceAudio.js

class DiceAudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.lastImpactTime = 0;
    }

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
     * صدای پرتاب اولیه تاس‌ها (صدای برخورد ملایم تاس‌ها با هم هنگام رها شدن)
     */
    playThrow(diceCount = 1) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const count = Math.min(Math.max(diceCount, 1), 6);
        const now = this.ctx.currentTime;

        // کلاستر کلیک‌های خشک رزینی واقعی در دست
        for (let i = 0; i < count + 1; i++) {
            const delay = i * 0.035 + Math.random() * 0.02;
            const clickSize = Math.floor(this.ctx.sampleRate * 0.025);
            const clickBuffer = this.ctx.createBuffer(1, clickSize, this.ctx.sampleRate);
            const clickData = clickBuffer.getChannelData(0);

            for (let j = 0; j < clickSize; j++) {
                clickData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (clickSize * 0.15));
            }

            const clickSrc = this.ctx.createBufferSource();
            clickSrc.buffer = clickBuffer;

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(2800 + Math.random() * 1200, now + delay);
            bandpass.Q.setValueAtTime(3.5, now + delay);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.18, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.024);

            clickSrc.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(this.ctx.destination);

            clickSrc.start(now + delay);
            clickSrc.stop(now + delay + 0.026);
        }
    }

    /**
     * صدای تقه واقعی برخورد تاس روی میز نمدی/چوبی (Real Resin Dice Clack)
     * بدون هیچ‌گونه فرکانس بم طبل‌مانند
     */
    playImpact(intensity = 0.5) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // فاصله زمانی مینیمال برای شبیه‌سازی غلتش‌های ریز و تقه‌های پیوسته
        if (now - this.lastImpactTime < 0.02) return;
        this.lastImpactTime = now;

        const clampedIntensity = Math.min(Math.max(intensity, 0.15), 1.0);

        // ۱. ضربه تیز لبه تاس رزینی (Sharp Resin Transient)
        const clickLen = Math.floor(this.ctx.sampleRate * 0.03);
        const clickBuf = this.ctx.createBuffer(1, clickLen, this.ctx.sampleRate);
        const data = clickBuf.getChannelData(0);

        for (let i = 0; i < clickLen; i++) {
            // انحطاط فوق‌العاده سریع جهت ایجاد صدای خشک، شفاف و واقعی
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / clickLen, 6);
        }

        const clickSource = this.ctx.createBufferSource();
        clickSource.buffer = clickBuf;

        const clickFilter = this.ctx.createBiquadFilter();
        clickFilter.type = 'bandpass';
        // فرکانس طبیعی صدای برخورد پلی‌رزین
        const baseFreq = 2600 + (Math.random() - 0.5) * 600;
        clickFilter.frequency.setValueAtTime(baseFreq, now);
        clickFilter.Q.setValueAtTime(4.0, now);

        const clickGain = this.ctx.createGain();
        const clickVol = clampedIntensity * 0.55;
        clickGain.gain.setValueAtTime(clickVol, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

        clickSource.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickSource.start(now);
        clickSource.stop(now + 0.03);

        // ۲. تپش کوتاه و چوبی سطح میز (خشک و بدون بم اضافه)
        const tapOsc = this.ctx.createOscillator();
        const tapGain = this.ctx.createGain();

        tapOsc.type = 'triangle';
        const tapFreq = 320 + (Math.random() - 0.5) * 40; // صدای فرورفتن در نمد/چوب
        tapOsc.frequency.setValueAtTime(tapFreq, now);
        tapOsc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

        const tapVol = clampedIntensity * 0.28;
        tapGain.gain.setValueAtTime(tapVol, now);
        tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        tapOsc.connect(tapGain);
        tapGain.connect(this.ctx.destination);

        tapOsc.start(now);
        tapOsc.stop(now + 0.038);
    }
}

export const diceAudio = new DiceAudioEngine();