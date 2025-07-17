"use client";
import React, { useEffect, useState } from "react";

export default function SettingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [success, setSuccess] = useState("");

  // Load dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    } else {
      setDarkMode(false);
      document.body.classList.remove("dark-mode");
    }
  }, []);

  // Toggle dark mode class and save to localStorage
  const handleToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("تنظیمات با موفقیت ذخیره شد.");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto", direction: "rtl" }}>
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">تنظیمات</h3>
        <form onSubmit={handleSave}>
          <div className="form-check form-switch mb-4 text-end">
            <input
              className="form-check-input"
              type="checkbox"
              id="darkModeSwitch"
              checked={darkMode}
              onChange={e => handleToggle(e.target.checked)}
            />
            <label className="form-check-label me-2" htmlFor="darkModeSwitch">
              حالت شب / روشن
            </label>
          </div>
          {success && <div className="alert alert-success py-2 text-center">{success}</div>}
          <button type="submit" className="btn btn-primary w-100">ذخیره تنظیمات</button>
        </form>
      </div>
    </div>
  );
} 