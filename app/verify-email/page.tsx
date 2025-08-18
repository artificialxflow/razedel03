"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="container-fluid">
      <div className="row align-items-center justify-content-center vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0 rounded-lg p-4">
            <div className="card-body text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
              <h4>در حال بارگذاری...</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component that uses search params
function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // اگر کاربر قبلاً لاگین کرده، به dashboard هدایت کن
    if (user) {
      router.replace("/dashboard");
      return;
    }

    // بررسی پارامترهای URL
    const accessToken = searchParams?.get('access_token');
    const refreshToken = searchParams?.get('refresh_token');
    const type = searchParams?.get('type');

    if (type === 'signup' && accessToken) {
      // تایید ایمیل موفق
      setStatus('success');
      setMessage("ایمیل شما با موفقیت تایید شد! حالا می‌توانید وارد شوید.");
    } else if (type === 'recovery' && accessToken) {
      // بازیابی رمز عبور
      setStatus('success');
      setMessage("رمز عبور شما با موفقیت تغییر یافت! حالا می‌توانید وارد شوید.");
    } else {
      // خطا در تایید
      setStatus('error');
      setMessage("خطا در تایید ایمیل. لطفاً دوباره تلاش کنید.");
    }
  }, [user, router, searchParams]);

  return (
    <div className="container-fluid">
      <div className="row align-items-center justify-content-center vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0 rounded-lg p-4">
            <div className="card-body text-center">
              {status === 'loading' && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">در حال بارگذاری...</span>
                  </div>
                  <h4>در حال تایید ایمیل...</h4>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="text-success mb-3">
                    <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h4 className="text-success mb-3">تایید موفق!</h4>
                  <p className="text-muted mb-4">{message}</p>
                  <Link href="/login" className="btn btn-primary btn-lg">
                    ورود به حساب کاربری
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="text-danger mb-3">
                    <i className="bi bi-x-circle-fill" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h4 className="text-danger mb-3">خطا در تایید</h4>
                  <p className="text-muted mb-4">{message}</p>
                  <div className="d-grid gap-2">
                    <Link href="/signup" className="btn btn-outline-primary">
                      ثبت‌نام مجدد
                    </Link>
                    <Link href="/login" className="btn btn-primary">
                      ورود به حساب کاربری
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic import to avoid build time issues
const DynamicVerifyEmailContent = dynamic(() => Promise.resolve(VerifyEmailContent), {
  ssr: false,
  loading: () => <LoadingFallback />
});

// Main page component with proper Suspense boundary
export default function VerifyEmailPage() {
  return <DynamicVerifyEmailContent />;
}
