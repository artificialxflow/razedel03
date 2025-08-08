# لیست مراحل انجام پروژه (ToDo) - نسخه Supabase

## مرحله 1: تحلیل و طراحی
- [ ] تحلیل و جمع‌بندی نیازمندی‌ها بر اساس طرح‌های static
- [ ] طراحی UI/UX نهایی (رنگ، فونت، ریسپانسیو، تجربه کاربری)
- [x] تبدیل صفحات static به صفحات Next.js (Splash, Auth, Home, ارسال دل‌نوشته، پاسخ‌ها، پروفایل، درباره ما و تماس با ما)

## مرحله 2: راه‌اندازی پروژه و زیرساخت
- [x] راه‌اندازی پروژه Next.js (PWA) و ساختاردهی پوشه‌ها
- [x] پیاده‌سازی ناوبری و Drawer سراسری
- [x] پیاده‌سازی حالت شب/روشن
- [x] راه‌اندازی Supabase (Auth, Database, Storage)
- [x] پیکربندی متغیرهای محیطی Supabase (.env)

## مرحله 3: احراز هویت و دیتابیس
- [x] پیاده‌سازی احراز هویت Supabase (ایمیل، موبایل، مهمان)
- [x] طراحی و پیاده‌سازی جداول دیتابیس Supabase (دل‌نوشته، کاربر، فید، تاریخچه)
- [x] تنظیم Row Level Security (RLS) در Supabase
- [x] پیاده‌سازی Context برای مدیریت state کاربر

## مرحله 4: عملکردهای اصلی
- [x] پیاده‌سازی ارسال و دریافت دل‌نوشته (متن/صوت)
- [x] پیاده‌سازی انتخاب شنونده (AI یا انسان واقعی)
- [ ] اتصال به ChatGPT API یا مشابه برای پاسخ AI (Supabase Edge Functions)
- [ ] پیاده‌سازی فید عمومی و مشاهده دل‌نوشته‌های دیگران

## مرحله 5: ویژگی‌های پیشرفته
- [ ] پیاده‌سازی پرداخت درون‌برنامه‌ای (زرین‌پال/آیدی‌پی، Google/Apple)
- [x] پیاده‌سازی بخش مدیتیشن و منابع آرامش‌بخش
- [x] پیاده‌سازی پروفایل کاربری و تنظیمات
- [x] مدیریت و آپلود فایل‌های صوتی در Supabase Storage
- [ ] پیاده‌سازی سیستم گزارش/فیلتر محتوای نامناسب

## مرحله 6: تست و بهینه‌سازی
- [x] تست کامل (واحد، یکپارچه، امنیتی)
- [ ] بهینه‌سازی عملکرد و SEO
- [ ] مستندسازی کامل پروژه و به‌روزرسانی README
- [x] آماده‌سازی برای استقرار و انتشار (PWA)

## تغییرات اصلی نسبت به نسخه Firebase:
- ✅ استفاده از Supabase Auth به جای Firebase Auth
- ✅ استفاده از Supabase Database (PostgreSQL) به جای Firestore
- ✅ استفاده از Supabase Storage به جای Firebase Storage
- ✅ استفاده از Supabase Edge Functions به جای Cloud Functions
- ✅ تنظیم Row Level Security (RLS) برای امنیت
- [ ] استفاده از Supabase Realtime برای به‌روزرسانی زنده

## کارهای انجام شده:
- ✅ حذف Firebase و نصب Supabase
- ✅ ایجاد فایل supabase.js با helper functions
- ✅ ایجاد AuthContext برای مدیریت state
- ✅ بروزرسانی صفحات login و signup
- ✅ بروزرسانی dashboard و صفحه اصلی
- ✅ بروزرسانی Navbar با عملکرد خروج
- ✅ پیکربندی متغیرهای محیطی
- ✅ ایجاد تمام جداول دیتابیس
- ✅ تنظیم RLS Policies
- ✅ ایجاد Storage Buckets
- ✅ اضافه کردن Sample Data برای مدیتیشن
- ✅ پیاده‌سازی صفحه ارسال پیام جدید (newmessage)
- ✅ پیاده‌سازی صفحه صندوق پیام‌ها (messagebox)
- ✅ پیاده‌سازی صفحه پروفایل کاربر (profile)
- ✅ پیاده‌سازی صفحه تنظیمات (setting)
- ✅ پیاده‌سازی صفحه مدیتیشن (meditation)
- ✅ پیاده‌سازی صفحه درباره ما (about)
- ✅ پیاده‌سازی صفحه تماس با ما (contact)
- ✅ رفع خطاهای build و deploy
- ✅ تست کامل build در محیط production
- ✅ بهبود error handling در supabase.js

## مشکلات حل شده:
- ✅ خطای "Module not found: Can't resolve 'firebase/auth'" در profile/page.tsx
- ✅ خطای "Module not found: Can't resolve '@supabase/supabase-js'" در local development
- ✅ خطای build در Vercel deployment
- ✅ پاک کردن کش Next.js و نصب مجدد dependencies
- ✅ خطای "supabaseUrl is required" در production build

## مشکل فعلی:
- [ ] تنظیم متغیرهای محیطی Supabase در Vercel:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

## مرحله بعدی:
1. **تنظیم متغیرهای محیطی در Vercel** (ضروری برای deploy)
2. اتصال به ChatGPT API برای پاسخ‌های هوش مصنوعی
3. پیاده‌سازی فید عمومی برای مشاهده پیام‌های دیگران
4. اضافه کردن Supabase Realtime برای به‌روزرسانی زنده
5. پیاده‌سازی سیستم پرداخت با زرین‌پال
6. بهینه‌سازی عملکرد و SEO
7. مستندسازی کامل پروژه

**برای deploy موفق، حتماً متغیرهای محیطی Supabase رو در Vercel تنظیم کنید!** 