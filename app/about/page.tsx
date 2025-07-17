"use client";
import React from "react";

export default function AboutPage() {
  return (
    <div className="container" style={{ maxWidth: 480, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-4">
        <h3 className="mb-3 text-center">درباره ما</h3>
        <div style={{ fontSize: 15, lineHeight: 2 }}>
          <p>
            راز دل یک پلتفرم آنلاین برای اشتراک‌گذاری احساسات و دریافت حمایت عاطفی است. هدف ما ایجاد فضایی امن، آرامش‌بخش و حرفه‌ای برای کاربران فارسی‌زبان است تا بتوانند دل‌نوشته‌های خود را به صورت ناشناس یا با هویت واقعی به اشتراک بگذارند و پاسخ مناسب دریافت کنند.
          </p>
          <p>
            تیم ما متشکل از توسعه‌دهندگان، طراحان و مشاوران حوزه سلامت روان است که با عشق و تخصص تلاش می‌کنند تجربه‌ای متفاوت و مفید برای شما فراهم کنند.
          </p>
          <p className="text-muted mt-3" style={{ fontSize: 13 }}>
            نسخه فعلی: PWA با Next.js و Firebase — تمامی حقوق متعلق به تیم راز دل است.
          </p>
        </div>
      </div>
    </div>
  );
} 