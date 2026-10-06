import { redirect } from "next/navigation";

// Root diarahkan ke /home; guard di /home akan melempar ke /login jika belum masuk.
export default function RootPage() {
  redirect("/home");
}
