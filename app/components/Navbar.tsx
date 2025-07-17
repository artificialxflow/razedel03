"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/newmessage", label: "پیام جدید" },
  { href: "/messagebox", label: "صندوق ورودی" },
  { href: "/meditation", label: "مدیتیشن" },
  { href: "/profile", label: "پروفایل" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/setting", label: "تنظیمات" },
  { href: "/login", label: "خروج", className: "text-danger" },
];

export default function Navbar() {
  const pathname = usePathname();

  // Do not render navbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm d-none d-lg-block">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" href="/dashboard">راز دل</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0" style={{ gap: 30 }}>
            {navLinks.map(link => (
              <li className="nav-item" key={link.href}>
                <Link className={`nav-link ${pathname === link.href ? 'active' : ''} ${link.className || ''}`} href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
