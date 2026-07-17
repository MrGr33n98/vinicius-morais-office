"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [returnUrl, setReturnUrl] = useState("/portal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedReturnUrl = params.get("returnUrl") || "/portal";

      if (requestedReturnUrl.startsWith("/portal") && !requestedReturnUrl.startsWith("//")) {
        setReturnUrl(requestedReturnUrl);
      }

      if (params.get("expired") === "1") {
        setNotice("Sua sessão expirou por segurança. Entre novamente para continuar.");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível entrar com esses dados. Confira o e-mail e a senha.");
      }

      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user_role", data.user?.role || "client_owner");
      localStorage.setItem("user_name", data.user?.name || "");
      localStorage.setItem("remember_portal_access", remember ? "true" : "false");
      router.push(returnUrl);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="portal-login-page">
      <section className="portal-login-shell" aria-label="Acesso ao Portal do Cliente">
        <div className="portal-login-brand-panel">
          <Link href="/" className="portal-login-logo" aria-label="Voltar para a página inicial">
            <span>V|M</span>
            <div>
              <strong>ADVOCACIA</strong>
              <small>Cuiabá · Mato Grosso</small>
            </div>
          </Link>

          <div className="portal-login-copy">
            <span className="portal-login-eyebrow">Portal do Cliente</span>
            <h1>Acompanhe seu processo com clareza e segurança.</h1>
            <p>
              Consulte andamentos, documentos, prazos e mensagens da equipe em um ambiente reservado para clientes.
            </p>
          </div>

          <div className="portal-login-preview">
            <Image
              src="/02-dashboard-notebook-e-celular.webp"
              alt="Prévia do painel do Portal do Cliente"
              fill
              sizes="(max-width: 900px) 100vw, 520px"
              priority
              style={{ objectFit: "cover", objectPosition: "left center" }}
            />
          </div>

          <div className="portal-login-benefits" aria-label="Benefícios do portal">
            {[
              ["Atualizações centralizadas", "Veja movimentações e próximos passos."],
              ["Documentos protegidos", "Acesse arquivos compartilhados pela equipe."],
              ["Contato direto", "Envie mensagens sem perder o histórico."],
            ].map(([title, description]) => (
              <div key={title}>
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-login-form-panel">
          <div className="portal-login-form-card">
            <div className="portal-login-form-header">
              <span>Acesso seguro</span>
              <h2>Entrar no Portal</h2>
              <p>Use os dados enviados pelo escritório para acessar sua área do cliente.</p>
            </div>

            {error && (
              <div className="portal-login-alert" role="alert">
                {error}
              </div>
            )}

            {notice && !error && (
              <div className="portal-login-alert portal-login-alert-info" role="status">
                {notice}
              </div>
            )}

            <form onSubmit={handleLogin} className="portal-login-form">
              <div className="portal-login-field">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="portal-login-field">
                <div className="portal-login-label-row">
                  <label htmlFor="password">Senha</label>
                  <button type="button" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="portal-login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Manter acesso neste dispositivo
                </label>
                <a href="mailto:contato@vmadvocacia.com.br?subject=Acesso%20ao%20Portal%20do%20Cliente">
                  Preciso de ajuda
                </a>
              </div>

              <button type="submit" className="portal-login-submit" disabled={loading || !email || !password}>
                {loading ? "Verificando acesso..." : "Entrar no Portal"}
              </button>

            </form>

            <div className="portal-login-support">
              <span>Atendimento do escritório</span>
              <a href="tel:+5565999098888">(65) 99909-8888</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
