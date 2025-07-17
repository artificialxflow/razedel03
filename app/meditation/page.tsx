"use client";
import React from "react";

const inspirations = [
  "امروز را با امید و آرامش آغاز کن.",
  "هر لحظه فرصتی برای شروع دوباره است.",
  "تو قوی‌تر از آنی هستی که فکر می‌کنی.",
  "نفس عمیق بکش و به خودت لبخند بزن.",
  "آرامش را در دل خودت پیدا کن، نه در دنیای بیرون.",
  "گاهی فقط کافیست رها کنی و به جریان زندگی اعتماد کنی.",
];

export default function MeditationPage() {
  return (
    <div className="container" style={{ maxWidth: 480, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-3">
        <h3 className="mb-3 text-center">مدیتیشن و جملات الهام‌بخش</h3>
        <div className="d-flex flex-column gap-3">
          {inspirations.map((txt, i) => (
            <div key={i} className="card p-3 shadow-sm text-center" style={{ background: "#F7C8E0", border: 0 }}>
              <span style={{ fontSize: 16 }}>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 