import type { Role } from "./auth-context";

export type NavItem = { href: string; label: string };

export const NAV: Record<Role, NavItem[]> = {
  staff: [
    { href: "/beranda", label: "Beranda" },
    { href: "/riwayat", label: "Riwayat" },
    { href: "/kontrol", label: "Kontrol" },
  ],
  admin: [
    { href: "/admin/akun", label: "Kelola akun" },
    { href: "/admin/ruang-tanam", label: "Kelola ruang tanam" },
    { href: "/admin/blok", label: "Kelola blok" },
    { href: "/admin/slave", label: "Kelola slave" },
  ],
};

// Halaman utama tiap peran (tujuan setelah login / saat salah halaman)
export const LANDING: Record<Role, string> = {
  staff: "/beranda",
  admin: "/admin/blok",
};
