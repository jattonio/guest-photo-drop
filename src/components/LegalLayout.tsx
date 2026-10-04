import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import LegalLinks from '@/components/LegalLinks';

const LEGAL_PENDING = '[PENDIENTE DE REVISIÓN LEGAL]';

interface LegalSectionData {
  heading: string;
}

interface LegalLayoutProps {
  title: string;
  sections: LegalSectionData[];
}

// Esqueleto de documento legal: cada sección lleva el marcador hasta que
// el área legal entregue el texto definitivo. No escribir texto legal aquí.
const LegalLayout = ({ title, sections }: LegalLayoutProps) => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-prose px-6 py-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Inicio
      </Link>

      <article>
        <header className="mb-10 border-b border-border pb-6">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Última actualización: {LEGAL_PENDING}</p>
        </header>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <section key={section.heading} aria-labelledby={`legal-${i}`}>
              <h2 id={`legal-${i}`} className="mb-3 font-heading text-xl font-semibold">
                {section.heading}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">{LEGAL_PENDING}</p>
            </section>
          ))}
        </div>
      </article>

      <footer className="mt-12 border-t border-border pt-6">
        <LegalLinks />
      </footer>
    </div>
  </div>
);

export default LegalLayout;
