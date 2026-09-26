// src/features/dice/state/dice.store.js
import { create } from 'zustand';
import { DICE_CONFIGS } from '../engine/diceDefinitions';

export const useDiceStore = create((set, get) => ({
    isOpen: false,
    isRolling: false,
    activeDice: [],
    results: [],
    totalSum: 0,
    rollHistory: [],

    setOpen: (isOpen) => set({ isOpen }),

    triggerRoll: (diceTypes = ['d20']) => {
        // اعتبارسنجی نوع تاس‌ها؛ حالا که هر ۷ نوع D&D پشتیبانی می‌شود، این فقط
        // جلوی یک تایپوی احتمالی در نام تاس را می‌گیرد (نه یک محدودیت واقعی)
        const safeTypes = diceTypes.map((t) => (DICE_CONFIGS[t] ? t : 'd20'));

        const newDice = safeTypes.map((type, idx) => ({
            id: `${type}-${Date.now()}-${idx}-${Math.random()}`,
            type,
            settled: false,
            value: null,
            // A believable tabletop throw: start above the tray, throw inward and
            // slightly downward, with controlled rather than absurd spin.
            initialPos: [
                (Math.random() - 0.5) * 3.8,
                3.6 + Math.random() * 1.4,
                (Math.random() - 0.5) * 3.8,
            ],
            initialRotation: [
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
            ],
            initialLinearVelocity: (() => {
                const x = -((Math.random() - 0.5) * 3.8);
                const z = -((Math.random() - 0.5) * 3.8);
                return [
                    x + (Math.random() - 0.5) * 1.5,
                    -1.5 - Math.random() * 2.0,
                    z + (Math.random() - 0.5) * 1.5,
                ];
            })(),
            initialAngularVelocity: [
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18,
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
        const updatedDice = activeDice.map((d) =>
            d.id === dieId ? { ...d, settled: true, value } : d
        );

        const newResults = [...results.filter((r) => r.id !== dieId), { id: dieId, value }];
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