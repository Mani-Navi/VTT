import React from "react";

export const AVATAR_LIST = [
    { id: "cowboy", name: "ماجراجوی کلاه‌چرمی", col: 0, row: 0 },
    { id: "gamer", name: "خنیاگر نئونی", col: 1, row: 0 },
    { id: "catgirl", name: "روگ گربه‌ای", col: 0, row: 1 },
    { id: "fox", name: "روباه اشرافی", col: 1, row: 1 },
    { id: "warrior", name: "جنگجوی هدبند آبی", col: 0, row: 2 },
    { id: "aviator", name: "مخترع بادها", col: 1, row: 2 },
    { id: "wizard", name: "کیمیاگر کهن", col: 0, row: 3 },
    { id: "druid", name: "دروئید طبیعت", col: 1, row: 3 },
    { id: "birdfolk", name: "مسافر پرنده‌نما", col: 0, row: 4 },
    { id: "artificer", name: "مهندس موآبی", col: 1, row: 4 },
];

export const RpgAvatar = ({ avatarId = "cowboy", className = "w-16 h-16" }) => {
    const avatar = AVATAR_LIST.find((a) => a.id === avatarId) || AVATAR_LIST[0];

    // محاسبه دقیق مرکز سلول‌ها با زوم ۲۱۸٪ در ۵۴۵٪ جهت حذف کامل خطوط سفید حاشیه‌ای
    const posX = avatar.col === 0 ? "3%" : "97%";
    const posY = `${avatar.row * 24.8 + 1}%`;

    return (
        <div
            className={`rounded-full overflow-hidden shrink-0 select-none bg-zinc-950 ${className}`}
            style={{
                backgroundImage: "url(/images/avatars-sheet.jpg)",
                backgroundSize: "218% 545%",
                backgroundPosition: `${posX} ${posY}`,
                backgroundRepeat: "no-repeat",
            }}
        />
    );
};