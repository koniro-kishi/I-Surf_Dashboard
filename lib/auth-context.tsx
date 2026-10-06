"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, db } from "./firebase";

export type Role = "admin" | "staff";

export type Profile = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  block: string | null; // null untuk admin
};

type Status = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: Status;
  profile: Profile | null;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Memetakan kode error Firebase ke pesan yang bisa dipahami pengguna. */
function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-email":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email atau kata sandi salah.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    case "auth/network-request-failed":
      return "Tidak ada koneksi internet. Periksa jaringan Anda.";
    case "auth/user-disabled":
      return "Akun ini dinonaktifkan.";
    default:
      return "Gagal masuk. Silakan coba lagi.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setStatus("unauthenticated");
        return;
      }

      // Tolak akun yang tidak boleh memakai dashboard (profil hilang, role "device", dst.)
      const deny = async (message: string) => {
        setAuthError(message);
        await fbSignOut(auth); // memicu callback ini lagi dengan user = null
      };

      try {
        const snap = await get(ref(db, `users/${user.uid}`));
        const data = snap.val();

        if (!data || typeof data.name !== "string") {
          return deny("Profil akun tidak ditemukan. Hubungi admin.");
        }
        if (data.role !== "admin" && data.role !== "staff") {
          return deny("Akun ini tidak memiliki akses ke dashboard.");
        }
        if (data.role === "staff" && !data.block) {
          return deny("Akun staff belum ditetapkan ke blok. Hubungi admin.");
        }

        setProfile({
          uid: user.uid,
          email: data.email ?? user.email ?? "",
          name: data.name,
          role: data.role,
          block: data.role === "staff" ? data.block : null,
        });
        setStatus("authenticated");
      } catch {
        await deny("Gagal memuat profil akun. Silakan coba lagi.");
      }
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Profil dimuat oleh onAuthStateChanged di atas.
    } catch (err) {
      setAuthError(authErrorMessage(err));
    }
  }

  async function signOut() {
    await fbSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ status, profile, authError, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
