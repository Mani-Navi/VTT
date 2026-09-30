// src/features/dice/state/dice.store.js
import { create } from 'zustand';
import { diceAudio } from '../engine/diceAudio';
import { wsService } from '../../../services/websocket.service';

// دریافت شناسه کاربر فعلی برای جلوگیری از اجرای تکراری رویدادهای بازگشتی از سرور
const getCurrentUser = () => {
    try {
        const stored = localStorage.getItem('vtt_user');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { id: 'local-user', username: 'بازیکن' };
};

export const useDiceStore = create((set, get) => ({
    isOpen: false,
    isRolling: false,
    activeDice: [],
    results: [],
    totalSum: 0,
    rollerName: null,
    isRemoteRoll: false,
    rollHistory: [],

    setOpen: (isOpen) => set({ isOpen }),

    /**
     * پرتاب تاس توسط بازیکن محلی و برودکست به تمام اعضای اتاق
     */
    triggerRoll: (diceTypes = ['d20'], customPhysics = null) => {
        diceAudio.playThrow(diceTypes.length);
        const user = getCurrentUser();

        const newDice = diceTypes.map((type, idx) => {
            const spreadX = (Math.random() - 0.5) * 1.5;
            const spreadZ = (Math.random() - 0.5) * 1.5;

            let initialPos;
            let initialLinearVelocity;
            let initialAngularVelocity;

            if (customPhysics) {
                const { origin, velocity, power } = customPhysics;
                initialPos = [
                    origin[0] + spreadX,
                    5.5 + Math.random() * 1.5,
                    origin[1] + spreadZ,
                ];
                initialLinearVelocity = [
                    velocity[0] + (Math.random() - 0.5) * 2,
                    -4 - (power * 0.15) - Math.random() * 3,
                    velocity[1] + (Math.random() - 0.5) * 2,
                ];
                const spinFactor = 15 + power * 0.35;
                initialAngularVelocity = [
                    (Math.random() > 0.5 ? 1 : -1) * (spinFactor + Math.random() * 15),
                    (Math.random() > 0.5 ? 1 : -1) * (spinFactor + Math.random() * 15),
                    (Math.random() > 0.5 ? 1 : -1) * (spinFactor + Math.random() * 15),
                ];
            } else {
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

        // به‌روزرسانی محلی
        set({
            isOpen: true,
            isRolling: true,
            isRemoteRoll: false,
            rollerName: null, // پرتاب متعلق به کاربر فعلی است
            activeDice: newDice,
            results: [],
            totalSum: 0,
        });

        // ارسال به وب‌سوکت برای بقیه بازیکنان
        wsService.send('DICE_ROLL', {
            senderId: user.id || user.userId || 'me',
            rollerName: user.displayName || user.username || user.name || 'بازیکن',
            dice: newDice,
        });
    },

    /**
     * اجرای پرتاب تاس دریافت شده از سایر بازیکنان از طریق وب‌سوکت
     */
    triggerRemoteRoll: (remoteDice, rollerName) => {
        if (!remoteDice || !Array.isArray(remoteDice) || remoteDice.length === 0) return;

        diceAudio.playThrow(remoteDice.length);

        set({
            isOpen: true,
            isRolling: true,
            isRemoteRoll: true,
            rollerName: rollerName || 'هم‌تیمی',
            activeDice: remoteDice,
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

    clearDice: () => set({ activeDice: [], results: [], totalSum: 0, isRolling: false, rollerName: null }),
}));