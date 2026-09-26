// src/features/dice/state/dice.store.js
import { create } from 'zustand';

export const useDiceStore = create((set, get) => ({
    isOpen: false,
    isRolling: false,
    activeDice: [],     // آرایه تاس‌های در حال پرتاب
    results: [],        // { id, type, value }
    totalSum: 0,
    rollHistory: [],

    setOpen: (isOpen) => set({ isOpen }),

    // ثبت دستور رول جدید (مثلاً ۲ عدد d20 و ۱ عدد d6)
    triggerRoll: (diceTypes = ['d20']) => {
        const newDice = diceTypes.map((type, idx) => ({
            id: `${type}-${Date.now()}-${idx}`,
            type,
            settled: false,
            value: null,
            // اسپان با آفست تصادفی در ارتفاع
            initialPos: [
                (Math.random() - 0.5) * 3,
                5 + Math.random() * 2,
                (Math.random() - 0.5) * 3
            ],
            // تکانه اولیه (پرتاب به سمت مرکز و پایین با سرعت زاویه‌ای شدید)
            initialImpulse: [
                (Math.random() - 0.5) * 6,
                -5 - Math.random() * 5,
                (Math.random() - 0.5) * 6
            ],
            initialTorque: [
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
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

    // ثبت نتیجه وقتی یک تاس به سکون فیزیکی کامل می‌رسد
    setDieResult: (dieId, value) => {
        const { activeDice, results } = get();
        const updatedDice = activeDice.map((d) =>
            d.id === dieId ? { ...d, settled: true, value } : d
        );

        const newResults = [...results.filter(r => r.id !== dieId), { id: dieId, value }];
        const allSettled = updatedDice.every((d) => d.settled);

        const sum = newResults.reduce((acc, curr) => acc + curr.value, 0);

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