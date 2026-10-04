import LegalLayout from '@/components/LegalLayout';

const sections = [
  { heading: 'Quién es el responsable' },
  { heading: 'Qué datos recopilamos' },
  { heading: 'Para qué usamos los datos' },
  { heading: 'Cuánto tiempo conservamos las fotos y los datos' },
  { heading: 'Con quién compartimos los datos' },
  { heading: 'Tus derechos' },
  { heading: 'Contacto' },
];

const Privacy = () => <LegalLayout title="Política de privacidad" sections={sections} />;

export default Privacy;
