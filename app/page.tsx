import { redirect } from "next/navigation";

// Root diarahkan ke /beranda; guard di layout melempar ke /login jika belum masuk,
// atau ke halaman utama admin jika yang masuk adalah admin.
export default function RootPage() {
  redirect("/beranda");
}
