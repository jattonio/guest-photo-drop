import LegalLayout from '@/components/LegalLayout';

const sections = [
  { heading: 'Qué contenido no se permite' },
  { heading: 'Cómo reportar una foto' },
  { heading: 'Cómo pedir que se elimine una foto en la que apareces' },
  { heading: 'Plazo de respuesta' },
];

const ContentPolicy = () => <LegalLayout title="Política de contenido" sections={sections} />;

export default ContentPolicy;
