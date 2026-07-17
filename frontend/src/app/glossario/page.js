import Link from "next/link";
import { fetchPublicJson, normalizeCollection } from "@/lib/public-api";

export const revalidate = 3600; // Cache longo de 1 hora para o glossário

async function getTerms() {
  const data = await fetchPublicJson("/api/v1/glossary_terms", {
    next: { revalidate: 3600 },
  });

  return normalizeCollection(data, "glossary_terms");
}

export default async function GlossaryPage() {
  const terms = await getTerms();
  
  // Agrupa os termos por letra inicial
  const grouped = terms.reduce((acc, curr) => {
    const letter = curr.term.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(curr);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div style={{ padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "16px", textAlign: "center" }}>
          Dicionário Jurídico Descomplicado
        </h1>
        <p style={{ textAlign: "center", color: "hsl(var(--text-secondary))", marginBottom: "48px" }}>
          Entenda o significado de termos jurídicos complexos em linguagem acessível e didática.
        </p>

        {/* Letras para navegação rápida */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          {letters.map(letter => (
            <a key={letter} href={`#letter-${letter}`} style={{
              padding: "8px 12px",
              backgroundColor: "hsl(var(--bg-secondary))",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "14px"
            }}>
              {letter}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {letters.length === 0 && (
            <div className="card" style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-secondary))" }}>
              Nenhum termo publicado no momento.
            </div>
          )}

          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`} style={{ scrollMarginTop: "100px" }}>
              <h2 style={{ fontSize: "28px", borderBottom: "2px solid hsl(var(--gold-primary))", paddingBottom: "8px", marginBottom: "16px", color: "hsl(var(--gold-primary))" }}>
                {letter}
              </h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {grouped[letter].map((item) => (
                  <Link key={item.id} href={`/glossario/${item.slug}`} className="card" style={{ display: "block", padding: "16px" }}>
                    <strong style={{ fontSize: "16px", color: "hsl(var(--text-primary))" }}>{item.term}</strong>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
