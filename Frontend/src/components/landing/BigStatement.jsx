import React from 'react';
import { GsapHeadingReveal } from './GsapHeadingReveal';

export const BigStatement = () => {
    return (
        <section
            id="statement"
            className="py-24 sm:py-36 md:py-44 px-6 md:px-12 text-center overflow-hidden"
            dir="rtl"
        >
            <div className="max-w-4xl mx-auto">
                <GsapHeadingReveal
                    lines={['بازی کردن', 'نباید پیچیده باشد.']}
                    gradientLineIndex={1}
                    gradientClassName="text-neutral-400"
                    subtitle="همه‌چیز برای شروع یک ماجراجویی، در یک میز مجازی ساده جمع شده است."
                    headingClassName="text-[44px] sm:text-[68px] md:text-[84px] lg:text-[96px] font-black leading-[1.05] tracking-[-0.035em] text-neutral-950"
                    subtitleClassName="mt-10 sm:mt-14 text-lg sm:text-xl md:text-2xl text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto"
                />
            </div>
        </section>
    );
};