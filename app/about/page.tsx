"use client";
import React from "react";

export default function AboutPage() {
  return (
    <main className="flex-grow-1 overflow-auto">
      <div className="container p-4">
        <div className="card shadow-lg border-0 rounded-lg p-5">
          <h1 className="display-5 fw-bold text-center mb-4">درباره راز دل</h1>
          <div className="lh-lg fs-5">
            <p>
              راز دل یک پلتفرم آنلاین برای اشتراک‌گذاری احساسات و دریافت حمایت عاطفی است. هدف ما ایجاد فضایی امن، آرامش‌بخش و حرفه‌ای برای کاربران فارسی‌زبان است تا بتوانند دل‌نوشته‌های خود را به صورت ناشناس یا با هویت واقعی به اشتراک بگذارند و پاسخ مناسب دریافت کنند.
            </p>
            <p>
              تیم ما متشکل از توسعه‌دهندگان، طراحان و مشاوران حوزه سلامت روان است که با عشق و تخصص تلاش می‌کنند تجربه‌ای متفاوت و مفید برای شما فراهم کنند.
            </p>
            <p className="text-muted mt-4">
              نسخه فعلی: PWA با Next.js و Supabase — تمامی حقوق متعلق به تیم راز دل است.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
