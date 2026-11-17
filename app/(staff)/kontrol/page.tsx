"use client";

import { useAuth } from "../../../lib/auth-context";
import ControlPanel from "../../../components/control-panel";

export default function KontrolPage() {
  const { profile } = useAuth();
  if (!profile) return null; // layout sudah menjamin profil ada

  return <ControlPanel profile={profile} />;
}
