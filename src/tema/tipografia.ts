// Tipografía de Activá Villaguay: Raleway en cuatro pesos fijos.
// (La fuente variable que viene en el manual arranca en peso "Thin", así que se
// generaron los pesos Regular, Medium, SemiBold y Bold a partir de ella.)
// En React Native con una fuente propia no se usa `fontWeight`: se elige el archivo.
export const FUENTES = {
  'Raleway-Regular': require('../../assets/fonts/Raleway-Regular.ttf'),
  'Raleway-Medium': require('../../assets/fonts/Raleway-Medium.ttf'),
  'Raleway-SemiBold': require('../../assets/fonts/Raleway-SemiBold.ttf'),
  'Raleway-Bold': require('../../assets/fonts/Raleway-Bold.ttf'),
};

export const fuente = {
  regular: 'Raleway-Regular',
  media: 'Raleway-Medium',
  seminegrita: 'Raleway-SemiBold',
  negrita: 'Raleway-Bold',
} as const;
