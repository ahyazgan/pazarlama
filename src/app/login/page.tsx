"use client";

import { useState } from "react";
import { signIn, signUp, signOut, useSession } from "@/lib/auth";

export default function LoginPage() {
  const { user, loading, configured } = useSession();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"giris" | "kayit">("giris");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = mode === "giris" ? await signIn(email, pw) : await signUp(email, pw);
    setMsg(error ?? (mode === "kayit" ? "Kayıt başarılı — e-postanı doğrula." : "Giriş başarılı."));
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Hesap</h1>

      {!configured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Supabase yapılandırılmamış. Uygulama şu an <strong>localStorage modunda</strong>
          çalışıyor (veriler bu tarayıcıda). Gerçek hesap + kalıcı veri için:
          <code className="mt-1 block text-xs">
            NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY → .env.local; supabase/schema.sql çalıştır
          </code>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Yükleniyor…</p>
      ) : user ? (
        <div className="card space-y-3">
          <p className="text-sm">
            Giriş yapıldı: <strong>{user.email}</strong>
          </p>
          <button type="button" className="btn-ghost" onClick={() => void signOut()}>
            Çıkış yap
          </button>
        </div>
      ) : (
        <div className="card space-y-3">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className={`chip ${mode === "giris" ? "border-brand bg-brand text-white" : "border-neutral-300"}`}
              onClick={() => setMode("giris")}
            >
              Giriş
            </button>
            <button
              type="button"
              className={`chip ${mode === "kayit" ? "border-brand bg-brand text-white" : "border-neutral-300"}`}
              onClick={() => setMode("kayit")}
            >
              Kayıt
            </button>
          </div>
          <input
            className="input"
            type="email"
            placeholder="e-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="şifre"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="button" className="btn-primary" onClick={submit} disabled={busy || !configured}>
            {busy ? "…" : mode === "giris" ? "Giriş yap" : "Kayıt ol"}
          </button>
          {msg && <p className="text-sm text-neutral-600">{msg}</p>}
        </div>
      )}
    </div>
  );
}
