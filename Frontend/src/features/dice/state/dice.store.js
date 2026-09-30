// src/features/dice/state/dice.store.js
import { create } from 'zustand';
import { diceAudio } from '../engine/diceAudio';

export const useDiceStore = create((set, get) => ({
    isOpen: false,
    isRolling: false,
    activeDice: [],
    results: [],
    totalSum: 0,
    rollHistory: [],

    setOpen: (isOpen) => set({ isOpen }),

    /**
     * پرتاب تاس با پشتیبانی از فیزیک پرتاب دستی یا خودکار
     * @param {string[]} diceTypes - آرایه نوع تاس‌ها (مثلاً ['d20', 'd6'])
     * @param {object|null} customPhysics - تنظیمات فیزیکی پرتاب دستی اختیاری
     */
    triggerRoll: (diceTypes = ['d20'], customPhysics = null) => {
        diceAudio.playThrow(diceTypes.length);

        const newDice = diceTypes.map((type, idx) => {
            // انحراف جزئی تصادفی برای پرتاب هم‌زمان چند تاس تا در هوا به هم گره نخورند
            const spreadX = (Math.random() - 0.5) * 1.5;
            const spreadZ = (Math.random() - 0.5) * 1.5;

            let initialPos;
            let initialLinearVelocity;
            let initialAngularVelocity;

            if (customPhysics) {
                // حالت پرتاب دستی با شتاب و جهت تعیین‌شده توسط بازیکن
                const { origin, velocity, power } = customPhysics;

                // محل اسپان متناسب با موقعیت دست بازیکن با ارتفاع پرتاب
                initialPos = [
                    origin[0] + spreadX,
                    5.5 + Math.random() * 1.5,
                    origin[1] + spreadZ,
                ];

                // سرعت خطی بر اساس بردار دست بازیکن + یک پرتاب ملایم به سمت پایین
                initialLinearVelocity = [
                    velocity[0] + (Math.random() - 0.5) * 2,
                    -4 - (power * 0.15) - Math.random() * 3,
                    velocity[1] + (Math.random() - 0.5) * 2,
                ];

                // چرخش زاویه‌ای متناسب با شدت پرتاب (هرچه محکم‌تر، چرخش وحشیانه‌تر)
                const spinFactor = 15 + power * 0.35;
                initialAngularVelocity = [
                    (Math.random() > 0.5 ? 1 : -1) * (spinFactor + Math.random() * 15),
                    (Math.random() > 0.5 ? 1 : -1) * (spinFactor + Math.random() * 15),
                    (Math.random() > 0.5 ? 1 : -1) * (spinFactor + Math.random() * 15),
                ];
            } else {
                // حالت پیش‌فرض (پرتاب تصادفی نرم‌افزاری)
                initialPos = [
                    (Math.random() - 0.5) * 4,
                    6 + Math.random() * 2,
                    (Math.random() - 0.5) * 4,
                ];

                initialLinearVelocity = [
                    (Math.random() - 0.5) * 12,
                    -7 - Math.random() * 5,
                    (Math.random() - 0.5) * 12,
                ];

                initialAngularVelocity = [
                    (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
                    (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
                    (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
                ];
            }

            return {
                id: `${type}-${Date.now()}-${idx}-${Math.random()}`,
                type,
                settled: false,
                value: null,
                initialPos,
                initialRotation: [
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                ],
                initialLinearVelocity,
                initialAngularVelocity,
            };
        });

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

        const currentDie = activeDice.find((d) => d.id === dieId);
        const dieType = currentDie?.type || 'd20';

        const newResults = [
            ...results.filter((r) => r.id !== dieId),
            { id: dieId, type: dieType, value: Number(value) },
        ];

        const allSettled = updatedDice.every((d) => d.settled);

        // محاسبه مجموع با احتساب قوانین جفت درصد D&D 5e
        let sum = 0;
        const tensDie = newResults.find((r) => r.type === 'd100');
        const onesDie = newResults.find((r) => r.type === 'd10');

        if (tensDie && onesDie && newResults.length === 2) {
            const tensVal = Number(tensDie.value);
            const onesVal = Number(onesDie.value);
            sum = tensVal === 0 && onesVal === 0 ? 100 : tensVal + onesVal;
        } else {
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