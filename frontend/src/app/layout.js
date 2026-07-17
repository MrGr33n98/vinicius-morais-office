import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const viewport = { width: "device-width", initialScale: 1 };

export const metadata = {
  title: "V|M Advocacia | Soluções Jurídicas Estratégicas em Cuiabá - MT",
  description: "Atendimento jurídico especializado em Cuiabá e todo Mato Grosso. Atuamos com estratégia, agilidade e tecnologia para resultados reais. Direito Empresarial, Família, Civil, Tributário e mais.",
  keywords: "advocacia Cuiabá, advogado Mato Grosso, direito empresarial, planejamento sucessório, direito de família, direito tributário",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
