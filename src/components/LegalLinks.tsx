import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LEGAL_LINKS = [
  { to: '/privacidad', label: 'Privacidad' },
  { to: '/terminos', label: 'Términos' },
  { to: '/contenido', label: 'Política de contenido' },
];

const LegalLinks = ({ className }: { className?: string }) => (
  <nav aria-label="Información legal" className={cn('flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs', className)}>
    {LEGAL_LINKS.map((link) => (
      <Link key={link.to} to={link.to} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        {link.label}
      </Link>
    ))}
  </nav>
);

export default LegalLinks;
