// src/features/dice/state/dice.store.js
import { create } from 'zustand';

export const useDiceStore = create((set, get) => ({
    isOpen: false,
    isRolling: false,
    activeDice: [],
    results: [],
    totalSum: 0,
    rollHistory: [],

    setOpen: (isOpen) => set({ isOpen }),

    triggerRoll: (diceTypes = ['d20']) => {
        const newDice = diceTypes.map((type, idx) => ({
            id: `${type}-${Date.now()}-${idx}-${Math.random()}`,
            type,
            settled: false,
            value: null,
            // ۱. اسپان در ارتفاع مناسب و کمی متغیر
            initialPos: [
                (Math.random() - 0.5) * 4,
                6 + Math.random() * 2,
                (Math.random() - 0.5) * 4,
            ],
            // ۲. زاویه رندوم سه‌بعدی کامل تا هیچ‌وقت صاف نباشد
            initialRotation: [
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
            ],
            // ۳. پرتاب پرقدرت به سمت مرکز و پایین
            initialLinearVelocity: [
                (Math.random() - 0.5) * 12,
                -7 - Math.random() * 5,
                (Math.random() - 0.5) * 12,
            ],
            // ۴. سرعت زاویه‌ای شدید (غلتش و چرخش وحشیانه در هوا)
            initialAngularVelocity: [
                (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
                (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
                (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
            ],
        }));

        set({
            isOpen: true,
            isRolling: true,
            activeDice: newDice,
            results: [],
            totalSum: 0,
        });
    },

    setDieResult: (dieId, value) => {
        const { activeDice, results } = get();

        // آپدیت وضعیت سکون تاس
        const updatedDice = activeDice.map((d) =>
            d.id === dieId ? { ...d, settled: true, value } : d
        );

        const currentDie = activeDice.find((d) => d.id === dieId);
        const dieType = currentDie?.type || 'd20';

        // ذخیره نتیجه تاس به همراه Type دقیق آن
        const newResults = [
            ...results.filter((r) => r.id !== dieId),
            { id: dieId, type: dieType, value: Number(value) },
        ];

        const allSettled = updatedDice.every((d) => d.settled);

        // فرمول قطعی محاسبه مجموع
        let sum = 0;
        const tensDie = newResults.find((r) => r.type === 'd100');
        const onesDie = newResults.find((r) => r.type === 'd10');

        // اگر پرتاب مربوط به جفت تاس درصد (d100 + d10) باشد:
        if (tensDie && onesDie && newResults.length === 2) {
            const tensVal = Number(tensDie.value); // مثلاً 00, 10, 20, ..., 90
            const onesVal = Number(onesDie.value); // مثلاً 0, 1, 2, ..., 9

            if (tensVal === 0 && onesVal === 0) {
                sum = 100; // قانون رسمی D&D 5e: دو صفر یعنی ۱۰۰
            } else {
                sum = tensVal + onesVal; // مثال: 10 + 6 = 16
            }
        } else {
            // برای سایر پرتاب‌ها جمع معمولی
            sum = newResults.reduce((acc, curr) => acc + curr.value, 0);
        }

        set({
            activeDice: updatedDice,
            results: newResults,
            totalSum: sum,
            isRolling: !allSettled,
        });

        if (allSettled) {
            set((state) => ({
                rollHistory: [
                    { id: Date.now(), results: newResults, total: sum, timestamp: new Date() },
                    ...state.rollHistory.slice(0, 19),
                ],
            }));
        }
    },

    clearDice: () => set({ activeDice: [], results: [], totalSum: 0, isRolling: false }),
}));