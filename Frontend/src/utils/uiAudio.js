/**
 * موتور سنتز بلادرنگ صداهای رابط کاربری (Web Audio API Synthesizer)
 * بدون نیاز به هیچ فایل MP3 خارجی و کاملاً بهینه
 */
class UIAudioService {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
    }

    getContext() {
        if (typeof window === "undefined") return null;
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    // صدای قرار گرفتن ارگانیک توکن روی صفحه نقشه (Tabletop Token Drop)
    playTokenDrop() {
        try {
            const ctx = this.getContext();
            if (!ctx || this.isMuted) return;

            const now = ctx.currentTime;

            // ۱. ترنزینت کلیک ضربه اولیه
            const oscClick = ctx.createOscillator();
            const gainClick = ctx.createGain();
            oscClick.type = "triangle";
            oscClick.frequency.setValueAtTime(340, now);
            oscClick.frequency.exponentialRampToValueAtTime(90, now + 0.035);
            gainClick.gain.setValueAtTime(0.35, now);
            gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

            // ۲. رزونانس بدنه و میز نمدی/چوبی
            const oscBody = ctx.createOscillator();
            const gainBody = ctx.createGain();
            oscBody.type = "sine";
            oscBody.frequency.setValueAtTime(150, now);
            oscBody.frequency.exponentialRampToValueAtTime(55, now + 0.09);
            gainBody.gain.setValueAtTime(0.45, now);
            gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

            // فیلتر گرمای صوتی
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(850, now);

            oscClick.connect(gainClick);
            oscBody.connect(gainBody);
            gainClick.connect(filter);
            gainBody.connect(filter);
            filter.connect(ctx.destination);

            oscClick.start(now);
            oscBody.start(now);
            oscClick.stop(now + 0.04);
            oscBody.stop(now + 0.1);
        } catch {
            // ایمن در برابر Autoplay مرورگر
        }
    }

    // صدای تم دارک فانتزی اعلام پایان یا بستن اتاق بازی
    playRoomAlert() {
        try {
            const ctx = this.getContext();
            if (!ctx || this.isMuted) return;

            const now = ctx.currentTime;
            // آکورد سه‌صدایی مینور فانتزی (D4 - F4 - A4)
            const freqs = [293.66, 349.23, 440.0];

            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                const startTime = now + idx * 0.045;
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.001, startTime);
                gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 0.75);
            });
        } catch {
            // ایمن در برابر Autoplay مرورگر
        }
    }
}

export const uiAudio = new UIAudioService();