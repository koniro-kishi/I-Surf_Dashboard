"use client";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export default function Home() {
  const [value, setValue] = useState<string | null>(null);
  const [status, setStatus] = useState("memuat...");

  useEffect(() => {
    const unsub = onValue(
      ref(db, "test/hello"),
      (snap) => {
        if (snap.exists()) {
          setValue(snap.val());
          setStatus("terhubung");
        } else {
          setStatus("terhubung, tetapi node test/hello kosong");
        }
      },
      (err) => setStatus("ERROR: " + err.message),
    );
    return () => unsub();
  }, []);

  onValue(ref(db, ".info/connected"), (s) =>
    console.log("connected ke RTDB:", s.val()),
  );

  return (
    <p>
      {status} {value && `| nilai: ${value}`}
    </p>
  );
}
