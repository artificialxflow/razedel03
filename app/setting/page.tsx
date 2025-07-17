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
    <main className="flex-grow-1 overflow-auto p-lg-4">
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="card shadow-lg border-0 rounded-lg p-5">
              <h1 className="display-5 fw-bold text-center mb-4">تنظیمات</h1>
              <form onSubmit={handleSave}>
                <div className="mb-4">
                  <h5 className="fw-bold mb-3">ظاهر</h5>
                  <div className="form-check form-switch fs-5">
                    <input
                      className="form-check-input" 
                      type="checkbox" 
                      id="darkModeSwitch" 
                      checked={darkMode}
                      onChange={e => handleToggle(e.target.checked)}
                    />
                    <label className="form-check-label ms-3" htmlFor="darkModeSwitch">
                      حالت تاریک
                    </label>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">اعلان‌ها</h5>
                  <div className="form-check form-switch fs-5 mb-2">
                    <input className="form-check-input" type="checkbox" id="notificationSwitch1" defaultChecked />
                    <label className="form-check-label ms-3" htmlFor="notificationSwitch1">
                      دریافت اعلان‌های پیام جدید
                    </label>
                  </div>
                  <div className="form-check form-switch fs-5">
                    <input className="form-check-input" type="checkbox" id="notificationSwitch2" />
                    <label className="form-check-label ms-3" htmlFor="notificationSwitch2">
                      دریافت اعلان‌های لایک و کامنت
                    </label>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">حریم خصوصی</h5>
                  <div className="form-check form-switch fs-5">
                    <input className="form-check-input" type="checkbox" id="privacySwitch" defaultChecked />
                    <label className="form-check-label ms-3" htmlFor="privacySwitch">
                      نمایش وضعیت آنلاین
                    </label>
                  </div>
                </div>

                {success && <div className="alert alert-success text-center py-2 mb-3">{success}</div>}
                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">ذخیره تنظیمات</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
