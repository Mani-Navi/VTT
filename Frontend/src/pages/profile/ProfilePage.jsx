import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../store/auth.store";
import { userApi } from "../../api/user.api";
import { RpgAvatar, AVATAR_LIST } from "../../components/profile/RpgAvatar";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
    User as UserIcon,
    Shield,
    Mail,
    Check,
    X,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    LogOut,
    Layers,
    Crown,
    ArrowRight,
    Send,
    Timer,
    Award,
    ShieldCheck,
} from "lucide-react";

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "رمز عبور فعلی را وارد کنید"),
        newPassword: z.string().min(8, "حداقل ۸ کاراکتر").max(72, "حداکثر ۷۲ کاراکتر"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "رمز جدید و تکرار آن یکسان نیستند",
        path: ["confirmPassword"],
    });

const emailSchema = z.object({
    newEmail: z.string().email("ایمیل معتبر وارد کنید"),
    password: z.string().min(1, "رمز عبور را وارد کنید"),
});

const checkPasswordCriteria = (pass = "") => [
    { label: "حداقل ۸ کاراکتر", valid: pass.length >= 8 },
    { label: "حروف بزرگ و کوچک (a-Z)", valid: /[a-z]/.test(pass) && /[A-Z]/.test(pass) },
    { label: "حداقل یک عدد (0-9)", valid: /\d/.test(pass) },
    { label: "حداقل یک نماد خاص (!@#$%)", valid: /[^A-Za-z0-9]/.test(pass) },
];

export const ProfilePage = () => {
    const navigate = useNavigate();

    // سلکتورهای اتمیک جهت جلوگیری از رندرهای آبشاری (قانون شماره ۲)
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const setAuth = useAuthStore((state) => state.setAuth);
    const logout = useAuthStore((state) => state.logout);

    const [activeTab, setActiveTab] = useState("overview");
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [showEmailPass, setShowEmailPass] = useState(false);

    const [usernameInput, setUsernameInput] = useState(user?.username || "");
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

    const [verificationCode, setVerificationCode] = useState("");
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [timer, setTimer] = useState(0);

    const feedbackTimerRef = useRef(null);

    useEffect(() => {
        userApi
            .getProfile()
            .then((data) => {
                updateUser(data);
                setUsernameInput(data.username);
            })
            .catch((err) => {
                if (import.meta.env.DEV) {
                    console.warn("[Profile] Failed to fetch fresh profile:", err);
                }
            });
    }, [updateUser]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    useEffect(() => {
        return () => {
            if (feedbackTimerRef.current) {
                clearTimeout(feedbackTimerRef.current);
            }
        };
    }, []);

    const {
        register: registerPass,
        handleSubmit: handlePassSubmit,
        reset: resetPassForm,
        watch: watchPass,
        formState: { errors: passErrors, isSubmitting: isPassSubmitting },
    } = useForm({
        resolver: zodResolver(passwordSchema),
        mode: "onChange",
    });

    const {
        register: registerEmail,
        handleSubmit: handleEmailSubmit,
        reset: resetEmailForm,
        formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
    } = useForm({
        resolver: zodResolver(emailSchema),
    });

    const newPasswordValue = watchPass("newPassword", "");
    const criteria = useMemo(() => checkPasswordCriteria(newPasswordValue), [newPasswordValue]);
    const passedCriteriaCount = criteria.filter((c) => c.valid).length;

    const showFeedback = (type, text) => {
        setStatusMsg({ type, text });
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
        }
        feedbackTimerRef.current = setTimeout(() => {
            setStatusMsg({ type: "", text: "" });
        }, 4000);
    };

    const handleAvatarSelect = async (avatarId) => {
        try {
            const updated = await userApi.updateProfile({ avatarUrl: avatarId });
            updateUser(updated);
            showFeedback("success", "آواتار شما با موفقیت تغییر کرد.");
        } catch {
            showFeedback("error", "خطا در تغییر آواتار.");
        }
    };

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        if (!usernameInput || usernameInput === user?.username) return;

        try {
            setIsUpdatingUsername(true);
            const updated = await userApi.updateProfile({ username: usernameInput });
            updateUser(updated);
            showFeedback("success", "نام کاربری به‌روزرسانی شد.");
        } catch (err) {
            showFeedback("error", err.response?.data?.message || "این نام کاربری قبلاً انتخاب شده است.");
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const onSubmitPassword = async (data) => {
        try {
            await userApi.changePassword(data);
            resetPassForm();
            showFeedback("success", "رمز عبور با موفقیت تغییر کرد.");
        } catch (err) {
            showFeedback("error", err.response?.data?.message || "رمز فعلی اشتباه است.");
        }
    };

    const onSubmitEmail = async (data) => {
        try {
            const response = await userApi.changeEmail(data);
            setAuth(response.user, response.token);
            resetEmailForm();
            setCodeSent(false);
            setVerificationCode("");
            setTimer(0);
            showFeedback("success", "ایمیل با موفقیت تغییر یافت. اکنون می‌توانید کد تایید را برای ایمیل جدید دریافت کنید.");
        } catch (err) {
            showFeedback("error", err.response?.data?.message || "خطا در تغییر ایمیل.");
        }
    };

    const handleSendCode = async () => {
        try {
            setIsSendingCode(true);
            await userApi.sendVerificationCode();
            setCodeSent(true);
            setTimer(45);
            showFeedback("success", "کد تایید ۶ رقمی به ایمیل شما ارسال شد.");
        } catch {
            showFeedback("error", "خطا در ارسال کد تایید.");
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (verificationCode.length !== 6) {
            showFeedback("error", "لطفاً کد ۶ رقمی را به صورت کامل وارد کنید.");
            return;
        }

        try {
            setIsVerifyingCode(true);
            const updated = await userApi.verifyCode(verificationCode);
            updateUser(updated);
            setCodeSent(false);
            setVerificationCode("");
            setTimer(0);
            showFeedback("success", "ایمیل شما با موفقیت تایید هویت شد.");
        } catch (err) {
            showFeedback("error", err.response?.data?.message || "کد وارد شده اشتباه یا منقضی است.");
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const currentAvatarId = user?.avatarUrl || "cowboy";
    const isVerified = user?.isEmailVerified ?? user?.emailVerified ?? false;

    return (
        <div
            className="h-screen w-full bg-[#090a0f] text-zinc-100 font-fa select-none overflow-y-auto overflow-x-hidden flex flex-col"
            dir="rtl"
        >
            <header className="h-16 shrink-0 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-amber-400 transition-colors p-2 rounded-xl hover:bg-zinc-800/60"
                    >
                        <ArrowRight className="w-4 h-4" />
                        بازگشت به داشبورد
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        خروج از حساب
                    </button>
                </div>
            </header>

            <div className="flex-1 w-full">
                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                    <div className="relative bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative mb-3.5">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-xl shadow-amber-500/20 flex items-center justify-center">
                                <RpgAvatar avatarId={currentAvatarId} className="w-full h-full border-2 border-zinc-950" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-zinc-900 border border-amber-500/60 rounded-full px-2.5 py-0.5 shadow-md flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                                <Crown className="w-3 h-3 text-amber-400" />
                                <span>{user?.isPremium ? "عضو ویژه" : "Titipool"}</span>
                            </div>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-zinc-100">{user?.username}</h1>
                        <p className="text-xs text-zinc-400 mt-1">{user?.email}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-6 pt-5 border-t border-zinc-800/60">
                            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3 flex flex-col items-center">
                                <Layers className="w-4 h-4 text-amber-400 mb-1" />
                                <span className="text-base font-black text-zinc-100">{user?.roomsCount ?? 0}</span>
                                <span className="text-[11px] text-zinc-400">اتاق‌های ساخته شده</span>
                            </div>

                            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3 flex flex-col items-center">
                                <Crown className="w-4 h-4 text-amber-400 mb-1" />
                                <span className="text-sm font-black text-zinc-100">
                  {user?.isPremium ? "حساب پرمیوم" : "حساب استاندارد"}
                </span>
                                <span className="text-[11px] text-zinc-400">سطح اشتراک</span>
                            </div>

                            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3 flex flex-col items-center">
                                <CheckCircle2 className={`w-4 h-4 mb-1 ${isVerified ? "text-emerald-400" : "text-amber-400"}`} />
                                <span className="text-sm font-black text-zinc-100">
                  {isVerified ? "تایید شده" : "تایید نشده"}
                </span>
                                <span className="text-[11px] text-zinc-400">وضعیت ایمیل</span>
                            </div>
                        </div>
                    </div>

                    {statusMsg.text && (
                        <div
                            className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn ${
                                statusMsg.type === "success"
                                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                            }`}
                        >
                            {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>{statusMsg.text}</span>
                        </div>
                    )}

                    <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab("overview")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "overview"
                                        ? "bg-zinc-100 text-zinc-950 shadow-md"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                }`}
                            >
                                <UserIcon className="w-4 h-4" />
                                اطلاعات حساب
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("avatars")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "avatars"
                                        ? "bg-zinc-100 text-zinc-950 shadow-md"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                }`}
                            >
                                <Award className="w-4 h-4" />
                                انتخاب آواتار RPG
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("security")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "security"
                                        ? "bg-zinc-100 text-zinc-950 shadow-md"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                }`}
                            >
                                <Shield className="w-4 h-4" />
                                امنیت و پسورد
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("email")}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === "email"
                                        ? "bg-zinc-100 text-zinc-950 shadow-md"
                                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                                }`}
                            >
                                <Mail className="w-4 h-4" />
                                تنظیمات ایمیل
                            </button>
                        </div>

                        {activeTab === "overview" && (
                            <div className="space-y-4 max-w-md animate-fadeIn">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">نام کاربری</h3>
                                    <p className="text-xs text-zinc-400 mt-0.5">نام نمایشی شما در میزها و بازی‌ها</p>
                                </div>

                                <form onSubmit={handleUpdateUsername} className="space-y-4">
                                    <Input
                                        label="نام کاربری (Username)"
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        placeholder="مثلا: master_of_dungeons"
                                    />

                                    <Button
                                        type="submit"
                                        variant="amber"
                                        size="sm"
                                        isLoading={isUpdatingUsername}
                                        disabled={!usernameInput || usernameInput === user?.username}
                                        className="font-bold text-xs"
                                    >
                                        ذخیره تغییرات
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === "avatars" && (
                            <div className="space-y-4 animate-fadeIn">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">انتخاب کاراکتر ماجراجو</h3>
                                    <p className="text-xs text-zinc-400 mt-0.5">کاراکتر خود را برای نمایش در میزها انتخاب کنید:</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
                                    {AVATAR_LIST.map((avatar) => {
                                        const isSelected = currentAvatarId === avatar.id;
                                        return (
                                            <button
                                                key={avatar.id}
                                                type="button"
                                                onClick={() => handleAvatarSelect(avatar.id)}
                                                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                                                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                                                }`}
                                            >
                                                <RpgAvatar avatarId={avatar.id} className="w-16 h-16 shadow-md" />
                                                <span className="text-[11px] font-bold text-zinc-300 truncate w-full text-center">
                          {avatar.name}
                        </span>
                                                {isSelected && (
                                                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> فعال
                          </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <form onSubmit={handlePassSubmit(onSubmitPassword)} className="space-y-4 max-w-md animate-fadeIn">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-100">تغییر رمز عبور</h3>
                                    <p className="text-xs text-zinc-400 mt-0.5">رمز عبور فعلی و رمز عبور جدید را وارد کنید</p>
                                </div>

                                <div className="relative">
                                    <Input
                                        label="رمز عبور فعلی"
                                        type={showCurrentPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        error={passErrors.currentPassword?.message}
                                        disabled={isPassSubmitting}
                                        {...registerPass("currentPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                                        tabIndex={-1}
                                    >
                                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <Input
                                            label="رمز عبور جدید"
                                            type={showNewPass ? "text" : "password"}
                                            placeholder="••••••••"
                                            error={passErrors.newPassword?.message}
                                            disabled={isPassSubmitting}
                                            {...registerPass("newPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                                            tabIndex={-1}
                                        >
                                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {newPasswordValue.length > 0 && (
                                        <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-2">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-zinc-400">قدرت رمز جدید:</span>
                                                <span
                                                    className={`font-bold ${
                                                        passedCriteriaCount <= 1
                                                            ? "text-rose-400"
                                                            : passedCriteriaCount === 2
                                                                ? "text-amber-400"
                                                                : passedCriteriaCount === 3
                                                                    ? "text-cyan-400"
                                                                    : "text-emerald-400"
                                                    }`}
                                                >
                          {passedCriteriaCount <= 1
                              ? "ضعیف"
                              : passedCriteriaCount === 2
                                  ? "متوسط"
                                  : passedCriteriaCount === 3
                                      ? "خوب"
                                      : "بسیار قوی"}
                        </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                                                {criteria.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center gap-1 ${
                                                            item.valid ? "text-emerald-400" : "text-zinc-500"
                                                        }`}
                                                    >
                                                        {item.valid ? (
                                                            <Check className="w-3 h-3 shrink-0 text-emerald-400" />
                                                        ) : (
                                                            <X className="w-3 h-3 shrink-0 text-zinc-600" />
                                                        )}
                                                        <span>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        label="تکرار رمز عبور جدید"
                                        type={showConfirmPass ? "text" : "password"}
                                        placeholder="••••••••"
                                        error={passErrors.confirmPassword?.message}
                                        disabled={isPassSubmitting}
                                        {...registerPass("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    variant="amber"
                                    size="sm"
                                    isLoading={isPassSubmitting}
                                    className="font-bold text-xs"
                                >
                                    ثبت رمز عبور جدید
                                </Button>
                            </form>
                        )}

                        {activeTab === "email" && (
                            <div className="space-y-6 max-w-md animate-fadeIn">
                                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-[11px] text-zinc-400">ایمیل حساب کاربری:</span>
                                            <div className="text-sm font-bold text-zinc-200 mt-0.5">{user?.email}</div>
                                        </div>

                                        {isVerified ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        تایید شده
                      </span>
                                        ) : (
                                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
                        تایید نشده
                      </span>
                                        )}
                                    </div>

                                    {isVerified ? (
                                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2.5">
                                            <ShieldCheck className="w-5 h-5 shrink-0" />
                                            <span>ایمیل شما تایید هویت شده است و حساب شما دارای امنیت کامل می‌باشد.</span>
                                        </div>
                                    ) : (
                                        <div className="pt-3 border-t border-zinc-800 space-y-3">
                                            {!codeSent ? (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={handleSendCode}
                                                    isLoading={isSendingCode}
                                                    className="w-full text-xs font-bold"
                                                >
                                                    <Send className="w-3.5 h-3.5 ml-1.5" />
                                                    ارسال کد ۶ رقمی به ایمیل
                                                </Button>
                                            ) : (
                                                <form onSubmit={handleVerifyCode} className="space-y-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            maxLength={6}
                                                            value={verificationCode}
                                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                                            placeholder="کد ۶ رقمی"
                                                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest text-zinc-100 focus:border-amber-400 focus:outline-none"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            variant="amber"
                                                            size="sm"
                                                            isLoading={isVerifyingCode}
                                                            className="text-xs font-bold shrink-0"
                                                        >
                                                            تایید کد
                                                        </Button>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                                                        {timer > 0 ? (
                                                            <span className="flex items-center gap-1 text-amber-400 font-mono">
                                <Timer className="w-3.5 h-3.5" /> {timer} ثانیه تا امکان ارسال مجدد
                              </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleSendCode}
                                                                disabled={isSendingCode}
                                                                className="text-amber-400 hover:underline cursor-pointer font-bold"
                                                            >
                                                                ارسال مجدد کد تایید
                                                            </button>
                                                        )}
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleEmailSubmit(onSubmitEmail)} className="space-y-3.5 pt-2">
                                    <h4 className="text-xs font-bold text-zinc-300">درخواست تغییر آدرس ایمیل</h4>
                                    <Input
                                        label="ایمیل جدید"
                                        type="email"
                                        placeholder="new@example.com"
                                        error={emailErrors.newEmail?.message}
                                        disabled={isEmailSubmitting}
                                        {...registerEmail("newEmail")}
                                    />

                                    <div className="relative">
                                        <Input
                                            label="رمز عبور فعلی جهت تایید"
                                            type={showEmailPass ? "text" : "password"}
                                            placeholder="••••••••"
                                            error={emailErrors.password?.message}
                                            disabled={isEmailSubmitting}
                                            {...registerEmail("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEmailPass(!showEmailPass)}
                                            className="absolute left-3 top-[43px] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer flex items-center justify-center"
                                            tabIndex={-1}
                                        >
                                            {showEmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="amber"
                                        size="sm"
                                        isLoading={isEmailSubmitting}
                                        className="font-bold text-xs"
                                    >
                                        ثبت و تغییر ایمیل
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};