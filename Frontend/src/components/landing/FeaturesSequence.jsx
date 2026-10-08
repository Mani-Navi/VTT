import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Compass,
    Eye,
    EyeOff,
    Mic,
    MicOff,
    Grid,
    Image as ImageIcon,
    Zap,
    CheckCircle2,
    MousePointer,
    Hand,
    Pencil,
    Type,
    Ruler,
    Dices,
    Settings,
    Crown,
    User,
    Volume2,
    Scissors,
    Circle,
    Square,
    Triangle,
    Hexagon,
    PenTool,
    MapPin,
    Sparkles,
    Upload,
    Search,
    Maximize2,
    Copy,
    Check,
} from 'lucide-react';
import { sound } from '../../utils/tableAudio';
import { FEATURES } from '../../data/landingData';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const FeaturesSequence = () => {
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
    const current = FEATURES[selectedFeatureIndex];

    // استیت‌های تعاملی برای شبیه‌سازی زنده UI واقعی اتاق
    const [isFogCovered, setIsFogCovered] = useState(true);
    const [fogAction, setFogAction] = useState('reveal');
    const [fogBrush, setFogBrush] = useState('circle');
    const [isMicOn, setIsMicOn] = useState(false);
    const [gridType, setGridType] = useState('square');
    const [gridSize, setGridSize] = useState(60);
    const [isSnapping, setIsSnapping] = useState(true);
    const [assetTab, setAssetTab] = useState('maps');
    const [tokenPos, setTokenPos] = useState({ x: 140, y: 55 });

    const handleSelect = (idx) => {
        sound.playTokenClick();
        setSelectedFeatureIndex(idx);
    };

    const icons = [Compass, Eye, Mic, Grid, ImageIcon, Zap];

    return (
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-8 overflow-hidden w-full" dir="rtl">
            <div className="max-w-6xl mx-auto">
                {/* تیتر متناسب بدون کراپ */}
                <GsapHeadingReveal
                    eyebrow="معماری فنی و قابلیت‌ها · DEEP FEATURES"
                    lines={['تکامل ابزارهای بازی،', 'روی میز مجازی.']}
                    subtitle="رابط‌های کاربری زیر دقیقاً همان ابزارهای زنده، مدرن و شیشه‌ای هستند که در اتاق بازی تجربه می‌کنید."
                    containerClassName="max-w-2xl mx-auto mb-10 sm:mb-14 pt-4"
                />

                {/* تب‌های بالای سکشن */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 sm:mb-12 border-b border-neutral-200">
                    {FEATURES.map((item, idx) => {
                        const isSelected = selectedFeatureIndex === idx;
                        const Icon = icons[idx];
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(idx)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    isSelected
                                        ? 'bg-neutral-950 text-white shadow-md'
                                        : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#f59e0b]' : ''}`} />
                                <span className="font-mono text-[11px] opacity-70">{item.number}</span>
                                <span>{item.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* استیج اصلی حاوی UI واقعی اتاق */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-3xl bg-[#090a10] border border-[#222434] p-6 sm:p-10 md:p-12 shadow-[0_30px_90px_rgba(0,0,0,0.2)] text-right overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

                            {/* توضیحات سمت راست */}
                            <div className="lg:col-span-5">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-3xl font-black text-[#f59e0b]">
                                        {current.number}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-[#181b28] border border-[#2b3044] text-[11px] font-mono text-neutral-300">
                                        {current.badge}
                                    </span>
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-black text-white mt-4 tracking-tight leading-snug">
                                    {current.headline}
                                </h3>

                                <p className="text-sm text-neutral-400 mt-4 leading-relaxed">
                                    {current.description}
                                </p>

                                <div className="mt-6 space-y-2.5">
                                    {current.details.map((detail, dIdx) => (
                                        <div key={dIdx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                                            <CheckCircle2 className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                                            <span>{detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ویترین زنده UI واقعی اتاق در سمت چپ */}
                            <div className="lg:col-span-7">
                                <div className="rounded-2xl bg-[#0d0f17] border border-[#232637] p-3 sm:p-4 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-center">

                                    {/* ۱. نقشه و توکن: شبیه‌سازی واقعی بوم و Toolbar اصلی اتاق */}
                                    {current.mockUiType === 'map' && (
                                        <div className="space-y-3">
                                            <div className="relative h-60 rounded-xl bg-[#07080d] border border-zinc-800 overflow-hidden select-none">
                                                {/* گرید تاکتیکال */}
                                                <div
                                                    className="absolute inset-0 opacity-20 pointer-events-none"
                                                    style={{
                                                        backgroundImage: 'linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)',
                                                        backgroundSize: '36px 36px',
                                                    }}
                                                />

                                                {/* توکن تعاملی درگ‌پذیر با مشخصات واقعی */}
                                                <motion.div
                                                    drag
                                                    dragMomentum={false}
                                                    dragConstraints={{ left: 10, right: 320, top: 10, bottom: 120 }}
                                                    style={{ x: tokenPos.x, y: tokenPos.y }}
                                                    onDragEnd={(_, info) => setTokenPos((prev) => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                                                    className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center select-none"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                                        🧙‍♂️
                                                    </div>
                                                    <div className="mt-1 px-2 py-0.2 rounded bg-zinc-950/90 border border-zinc-700 text-[9px] text-white font-bold">
                                                        ویزارد (مانی)
                                                    </div>
                                                    <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden mt-0.5 border border-zinc-700">
                                                        <div className="w-[85%] h-full bg-emerald-400 rounded-full" />
                                                    </div>
                                                </motion.div>

                                                {/* نوار بزرگ‌نمایی کناری اتاق */}
                                                <div className="absolute bottom-2 left-2 flex items-center gap-1 p-1 bg-zinc-950/90 border border-zinc-800 rounded-lg text-[10px] text-zinc-300">
                                                    <span>100%</span>
                                                </div>
                                            </div>

                                            {/* کپی پیکسل‌به‌پیکسل Toolbar واقعی اتاق */}
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center gap-1 p-1.5 bg-zinc-950/90 border border-zinc-800/90 rounded-2xl shadow-xl backdrop-blur-2xl">
                                                    <button className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center shadow-md">
                                                        <MousePointer className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <Hand className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <Type className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <EyeOff className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <Ruler className="w-4 h-4" />
                                                    </button>
                                                    <div className="h-5 w-px bg-zinc-800 mx-0.5" />
                                                    <button className="w-8 h-8 rounded-xl text-amber-400 flex items-center justify-center">
                                                        <Dices className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center">
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ۲. مه جنگ: کپی پیکسل‌به‌پیکسل FogSubToolbar واقعی اتاق */}
                                    {current.mockUiType === 'fog' && (
                                        <div className="space-y-4">
                                            {/* بوم کوچک با ماسک مه */}
                                            <div className="relative h-44 rounded-xl bg-[#090a10] border border-zinc-800 overflow-hidden flex items-center justify-center">
                                                <div
                                                    className="absolute inset-0 opacity-20 pointer-events-none"
                                                    style={{
                                                        backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)',
                                                        backgroundSize: '24px 24px',
                                                    }}
                                                />
                                                <div className="text-2xl">🏰 تالار سلطنتی</div>

                                                {/* لایه تاریکی مه */}
                                                <div
                                                    className={`absolute inset-0 bg-zinc-950/90 transition-opacity duration-300 flex items-center justify-center ${
                                                        isFogCovered ? 'opacity-90' : 'opacity-0'
                                                    }`}
                                                >
                                                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-amber-400 font-bold flex items-center gap-1.5 shadow-lg">
                                                        <EyeOff className="w-4 h-4" />
                                                        <span>محیط در تاریکی پنهان است</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FogSubToolbar واقعی اتاق */}
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-2xl text-zinc-100 flex-wrap justify-center">
                                                    <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                sound.playTokenClick();
                                                                setFogAction('reveal');
                                                                setIsFogCovered(false);
                                                            }}
                                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                                fogAction === 'reveal'
                                                                    ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                                                                    : 'text-zinc-400 hover:text-white'
                                                            }`}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>آشکارساز</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                sound.playTokenClick();
                                                                setFogAction('hide');
                                                                setIsFogCovered(true);
                                                            }}
                                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                                fogAction === 'hide'
                                                                    ? 'bg-rose-600 text-white shadow-md'
                                                                    : 'text-zinc-400 hover:text-white'
                                                            }`}
                                                        >
                                                            <EyeOff className="w-3.5 h-3.5" />
                                                            <span>پوشاندن</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                sound.playTokenClick();
                                                                setFogAction('slice');
                                                            }}
                                                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                                fogAction === 'slice'
                                                                    ? 'bg-purple-600 text-white shadow-md'
                                                                    : 'text-zinc-400 hover:text-white'
                                                            }`}
                                                        >
                                                            <Scissors className="w-3.5 h-3.5" />
                                                            <span>برش</span>
                                                        </button>
                                                    </div>

                                                    <div className="h-5 w-px bg-zinc-800 mx-0.5" />

                                                    {/* اشکال براش */}
                                                    <div className="flex items-center gap-0.5 p-0.5 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                                        {[
                                                            { id: 'circle', icon: Circle },
                                                            { id: 'rect', icon: Square },
                                                            { id: 'poly', icon: PenTool },
                                                        ].map((sh) => {
                                                            const Icon = sh.icon;
                                                            return (
                                                                <button
                                                                    key={sh.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        sound.playTokenClick();
                                                                        setFogBrush(sh.id);
                                                                    }}
                                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                                                        fogBrush === sh.id
                                                                            ? 'bg-zinc-800 text-amber-400 border border-amber-500/50 font-bold'
                                                                            : 'text-zinc-400 hover:text-white'
                                                                    }`}
                                                                >
                                                                    <Icon className="w-3.5 h-3.5" />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="h-5 w-px bg-zinc-800 mx-0.5" />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            sound.playTokenClick();
                                                            setIsFogCovered(!isFogCovered);
                                                        }}
                                                        className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer active:scale-95"
                                                    >
                                                        {isFogCovered ? 'خالی کردن مه' : 'Fill Fog'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ۳. صدای بلادرنگ: کپی پیکسل‌به‌پیکسل کارت PlayerMenu و دکمه PTT */}
                                    {current.mockUiType === 'voice' && (
                                        <div className="space-y-3">
                                            {/* کارت اعضای حاضر در اتاق با ویوفرم صدا */}
                                            <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl p-3 shadow-xl space-y-2">
                                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                                                    <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                                                        <Dices className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>ماجراجویی D&D</span>
                                                    </div>
                                                    <span className="font-mono text-amber-400 text-[11px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                                        کد: 75B4EE
                                                    </span>
                                                </div>

                                                {/* ردیف میزبان (در حال صحبت) */}
                                                <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/50 shadow-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="relative">
                                                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                                                                MA
                                                            </div>
                                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950 absolute -bottom-0.5 -right-0.5 animate-pulse" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                                                <span>Mani (میزبان)</span>
                                                                {/* ویوفرم زنده صحبت */}
                                                                <div className="flex items-center gap-[2px]">
                                                                    <div className="w-[2px] h-2 bg-amber-400 rounded-full animate-pulse" />
                                                                    <div className="w-[2px] h-3.5 bg-amber-400 rounded-full animate-bounce" />
                                                                    <div className="w-[2px] h-2 bg-amber-400 rounded-full animate-pulse" />
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] text-zinc-400">دانجن‌مستر (DM)</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                        میزبان
                                                    </span>
                                                </div>

                                                {/* ردیف بازیکن عادی */}
                                                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
                                                            AM
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-zinc-200">امیر (پالادین)</div>
                                                            <div className="text-[10px] text-zinc-400">بازیکن آنلاین</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-400">
                                                        بازیکن
                                                    </span>
                                                </div>
                                            </div>

                                            {/* دکمه میکروفون Space پایین PlayerMenu */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const nextState = !isMicOn;
                                                    setIsMicOn(nextState);
                                                    sound.playPttBeep(nextState);
                                                }}
                                                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md select-none active:scale-[0.98] ${
                                                    isMicOn
                                                        ? 'bg-emerald-500 text-zinc-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                                        : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-750'
                                                }`}
                                            >
                                                {isMicOn ? <Mic className="w-4 h-4 text-zinc-950" /> : <MicOff className="w-4 h-4" />}
                                                <span>{isMicOn ? 'میکروفون فعال (کلیک یا Space برای قطع)' : 'میکروفون غیرفعال (کلیک یا Space برای وصل)'}</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* ۴. گرید و اندازه‌گیری: کپی پیکسل‌به‌پیکسل تب Grid در SettingsMenu */}
                                    {current.mockUiType === 'grid' && (
                                        <div className="space-y-3">
                                            <div className="bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-3 shadow-xl space-y-2.5">
                                                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-xs font-bold text-zinc-200">
                                                    <span className="flex items-center gap-1.5">
                                                        <Grid className="w-4 h-4 text-amber-400" />
                                                        <span>پیکربندی گرید تاکتیکال</span>
                                                    </span>
                                                    <span className="text-[10px] text-amber-400 font-mono">GM Panel</span>
                                                </div>

                                                {/* انتخاب نوع گرید */}
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { id: 'square', label: 'مربعی (Square)', desc: 'استاندارد D&D 5e' },
                                                        { id: 'isometric', label: 'لوزی (Isometric)', desc: 'دید پرسپکتیو' },
                                                        { id: 'hex_h', label: 'شش‌ضلعی افقی', desc: 'Hex Flat-Top' },
                                                        { id: 'hex_v', label: 'شش‌ضلعی عمودی', desc: 'Hex Pointy-Top' },
                                                    ].map((gt) => (
                                                        <button
                                                            key={gt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                sound.playTokenClick();
                                                                setGridType(gt.id);
                                                            }}
                                                            className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-0.5 ${
                                                                gridType === gt.id
                                                                    ? 'bg-amber-500/15 border-amber-500/80 text-amber-300 font-bold'
                                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850'
                                                            }`}
                                                        >
                                                            <span className="text-[11px] font-bold">{gt.label}</span>
                                                            <span className="text-[9px] text-zinc-500">{gt.desc}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* خط‌کش D&D 5e */}
                                                <div className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                                                    <span className="text-zinc-400 flex items-center gap-1.5">
                                                        <Ruler className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>سیستم محاسبه فاصله:</span>
                                                    </span>
                                                    <span className="font-mono text-amber-400 font-bold text-[11px]">
                                                        قانون D&D 5e (۵، ۱۰، ۱۵، ۲۰)
                                                    </span>
                                                </div>

                                                {/* اسلایدر سایز سلول‌ها */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-zinc-400">اندازه سلول‌ها:</span>
                                                        <span className="font-mono text-amber-400 font-bold">{gridSize} px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={30}
                                                        max={100}
                                                        value={gridSize}
                                                        onChange={(e) => setGridSize(Number(e.target.value))}
                                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                                    />
                                                </div>

                                                {/* کلید اسنپ */}
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className="text-xs text-zinc-300 font-bold">چسبیدن به سلول‌ها (Snapping)</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsSnapping(!isSnapping)}
                                                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                                            isSnapping ? 'bg-amber-500' : 'bg-zinc-800'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform absolute top-0.5 ${
                                                                isSnapping ? 'right-0.5' : 'right-5.5'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ۵. کتابخانه دارایی: کپی پیکسل‌به‌پیکسل پنجره AssetMenu */}
                                    {current.mockUiType === 'assets' && (
                                        <div className="space-y-3">
                                            <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl p-3 shadow-xl space-y-2.5">
                                                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                            <ImageIcon className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-zinc-100">کتابخانه منابع (Asset Library)</span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400">ذخیره ابری</span>
                                                </div>

                                                {/* تب نقشه‌ها / توکن‌ها */}
                                                <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAssetTab('maps')}
                                                        className={`flex items-center justify-center gap-1.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                                            assetTab === 'maps'
                                                                ? 'bg-amber-500 text-zinc-950 font-black'
                                                                : 'text-zinc-400 hover:text-white'
                                                        }`}
                                                    >
                                                        <MapPin className="w-3.5 h-3.5" />
                                                        <span>نقشه‌ها</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setAssetTab('tokens')}
                                                        className={`flex items-center justify-center gap-1.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                                            assetTab === 'tokens'
                                                                ? 'bg-amber-500 text-zinc-950 font-black'
                                                                : 'text-zinc-400 hover:text-white'
                                                        }`}
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>توکن‌ها</span>
                                                    </button>
                                                </div>

                                                {/* پیش‌نمایش کارت‌های نقشه‌ها دقیقا با استایل AssetMenu */}
                                                {assetTab === 'maps' ? (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="group rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 hover:border-amber-500 cursor-pointer transition-all">
                                                            <div className="h-16 bg-gradient-to-br from-amber-950 to-zinc-900 flex items-center justify-center text-xl">
                                                                🏰
                                                            </div>
                                                            <div className="p-1.5 bg-zinc-900/90 flex items-center justify-between text-[11px] font-bold text-zinc-200">
                                                                <span>قلعه باستانی</span>
                                                                <MapPin className="w-3 h-3 text-amber-400" />
                                                            </div>
                                                        </div>

                                                        <div className="group rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 hover:border-amber-500 cursor-pointer transition-all">
                                                            <div className="h-16 bg-gradient-to-br from-purple-950 to-zinc-900 flex items-center justify-center text-xl">
                                                                🌲
                                                            </div>
                                                            <div className="p-1.5 bg-zinc-900/90 flex items-center justify-between text-[11px] font-bold text-zinc-200">
                                                                <span>جنگل مه مرموز</span>
                                                                <MapPin className="w-3 h-3 text-amber-400" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {['🧙‍♂️ ویزارد', '🛡️ پالادین', '🐉 اژدها'].map((tok, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col items-center gap-1 hover:border-amber-500 cursor-pointer transition-all"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-amber-500/30 flex items-center justify-center text-lg">
                                                                    {tok.split(' ')[0]}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-zinc-300 truncate max-w-full">
                                                                    {tok.split(' ')[1]}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* دکمه آپلود مستقیم */}
                                                <button className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>آپلود فایل جدید (PNG, JPG, WEBP)</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ۶. همگام‌سازی بلادرنگ: شبیه‌سازی پروتکل STOMP و ارتباط اتاق */}
                                    {current.mockUiType === 'sync' && (
                                        <div className="space-y-3">
                                            <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl p-3 shadow-xl space-y-3">
                                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                        <span>STOMP WebSocket Connected</span>
                                                    </div>
                                                    <span className="font-mono text-zinc-400 text-[11px]">Ping: 34ms</span>
                                                </div>

                                                {/* کارت جریان رویدادها */}
                                                <div className="space-y-1.5 font-mono text-[11px]">
                                                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-zinc-300">
                                                        <span className="text-amber-400">GM: Token_Move (X: 180, Y: 120)</span>
                                                        <span className="text-emerald-400 text-[10px]">ACK 12ms</span>
                                                    </div>
                                                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-zinc-300">
                                                        <span className="text-indigo-400">Player 1: Roll D20 -> Nat 20!</span>
                                                        <span className="text-emerald-400 text-[10px]">SYNCED</span>
                                                    </div>
                                                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-zinc-300">
                                                        <span className="text-purple-400">GM: Fog_Slice (Layer 2)</span>
                                                        <span className="text-emerald-400 text-[10px]">BROADCAST</span>
                                                    </div>
                                                </div>

                                                <div className="text-[11px] text-zinc-400 text-center font-bold flex items-center justify-center gap-1.5 text-emerald-400">
                                                    <span>بدون رفرش صفحه · تأخیر زیر ۵۰ میلی‌ثانیه در سراسر کشور</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};