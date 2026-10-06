import { getApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signOut,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { db } from "./firebase";

export type NewAccount = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
  block: string | null; // wajib untuk staff, diabaikan untuk admin
};

/**
 * Instance Firebase kedua, khusus membuat akun. createUserWithEmailAndPassword
 * otomatis me-login-kan akun baru; dengan instance terpisah, sesi admin di
 * instance utama tidak tergantikan.
 */
function getCreatorAuth() {
  const NAME = "account-creator";
  const app =
    getApps().find((a) => a.name === NAME) ??
    initializeApp(getApp().options, NAME);
  return getAuth(app);
}

function createErrorMessage(err: unknown): string {
  switch ((err as { code?: string })?.code) {
    case "auth/email-already-in-use":
      return "Email sudah terdaftar.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/weak-password":
      return "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
    case "auth/network-request-failed":
      return "Tidak ada koneksi internet. Periksa jaringan Anda.";
    case "auth/admin-restricted-operation":
      return "Pembuatan akun dinonaktifkan di Firebase Console (Authentication > Settings > User actions).";
    default:
      return "Gagal membuat akun. Silakan coba lagi.";
  }
}

export async function createAccount(acc: NewAccount): Promise<void> {
  const creatorAuth = getCreatorAuth();

  // 1. Buat akun Auth lewat instance kedua
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(
      creatorAuth,
      acc.email,
      acc.password,
    );
  } catch (err) {
    throw new Error(createErrorMessage(err));
  }

  try {
    // 2. Tulis profil memakai sesi admin (instance utama), sesuai rules `users`
    await set(ref(db, `users/${credential.user.uid}`), {
      email: acc.email,
      name: acc.name,
      role: acc.role,
      ...(acc.role === "staff" ? { block: acc.block } : {}),
    });
  } catch (err) {
    // 3. Gagal menyimpan profil: batalkan akun Auth agar tidak jadi akun yatim.
    //    Instance kedua masih login sebagai akun baru, jadi boleh menghapusnya.
    await deleteUser(credential.user).catch(() => {});
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Profil gagal disimpan (${detail}). Pembuatan akun dibatalkan.`,
    );
  } finally {
    await signOut(creatorAuth).catch(() => {});
  }
}
