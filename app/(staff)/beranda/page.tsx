"use client";

import { useAuth } from "../../../lib/auth-context";
import GreenhousePanel from "../../../components/greenhouse-panel";

export default function BerandaPage() {
  const { profile } = useAuth();
  if (!profile) return null; // layout sudah menjamin profil ada; ini untuk tipe saja

  return <GreenhousePanel profile={profile} />;
}
