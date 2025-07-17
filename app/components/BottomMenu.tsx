"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: "/dashboard", label: "خانه", icon: "bi-house-door-fill" },
  { href: "/messagebox", label: "صندوق", icon: "bi-chat-dots-fill" },
  { href: "/newmessage", label: "", icon: "bi-plus-circle-fill" }, // Special item for the central button
  { href: "/meditation", label: "مدیتیشن", icon: "bi-music-note-beamed" },
  { href: "/profile", label: "پروفایل", icon: "bi-person-fill" },
];

export default function BottomMenu() {
  const pathname = usePathname();

  // Do not render bottom menu on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <div className="bottom-menu d-lg-none">
      <div className="d-flex justify-content-around align-items-center h-100" style={{ gap: 18 }}>
        {menuItems.map(item => (
          <Link href={item.href} key={item.href} className={`menu-item ${pathname === item.href ? 'active' : ''} ${item.href === '/newmessage' ? 'new-message-btn' : ''}`.trim()}>
            <i className={`bi ${item.icon}`}></i>
            {item.label && <span className="menu-label">{item.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}