"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/newmessage", label: "پیام جدید" },
  { href: "/messagebox", label: "صندوق ورودی" },
  { href: "/meditation", label: "مدیتیشن" },
  { href: "/profile", label: "پروفایل" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/setting", label: "تنظیمات" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();

  // Do not render navbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm d-none d-lg-block">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" href="/dashboard">راز دل</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0" style={{ gap: 30 }}>
            {navLinks.map(link => (
              <li className="nav-item" key={link.href}>
                <Link className={`nav-link ${pathname === link.href ? 'active' : ''}`} href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
            {user && (
              <li className="nav-item">
                <button 
                  onClick={handleSignOut}
                  className="nav-link text-danger border-0 bg-transparent"
                  style={{ cursor: 'pointer' }}
                >
                  خروج
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
