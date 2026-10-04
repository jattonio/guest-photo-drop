import LegalLayout from '@/components/LegalLayout';

const sections = [
  { heading: 'Aceptación de los términos' },
  { heading: 'Uso del servicio' },
  { heading: 'Cuenta del organizador' },
  { heading: 'Contenido que subes' },
  { heading: 'Responsabilidades y limitaciones' },
  { heading: 'Cambios a estos términos' },
  { heading: 'Contacto' },
];

const Terms = () => <LegalLayout title="Términos de uso" sections={sections} />;

export default Terms;
