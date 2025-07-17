"use client";
import React from "react";

const inspirations = [
  "امروز را با امید و آرامش آغاز کن.",
  "هر لحظه فرصتی برای شروع دوباره است.",
  "تو قوی‌تر از آنی هستی که فکر می‌کنی.",
  "نفس عمیق بکش و به خودت لبخند بزن.",
  "آرامش را در دل خودت پیدا کن، نه در دنیای بیرون.",
  "گاهی فقط کافیست رها کنی و به جریان زندگی اعتماد کنی.",
  "ذهن آرام، زندگی آرام.",
  "هر روز یک فرصت جدید است.",
  "قدردان لحظه حال باش.",
  "با هر نفس، آرامش را به درون بکش.",
  "تو لایق بهترین‌ها هستی.",
  "به ندای قلب خود گوش کن.",
];

export default function MeditationPage() {
  return (
    <main className="flex-grow-1 overflow-auto p-lg-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card shadow-lg border-0 rounded-lg p-5">
              <h1 className="display-5 fw-bold text-center mb-4">مدیتیشن و جملات الهام‌بخش</h1>
              <p className="lead text-center text-muted mb-5">با این جملات آرامش‌بخش، ذهن خود را تغذیه کنید.</p>
              <div className="row g-4">
                {inspirations.map((txt, i) => (
                  <div key={i} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 rounded-lg p-4 text-center d-flex flex-column justify-content-between">
                      <p className="fs-5 m-0">{txt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}