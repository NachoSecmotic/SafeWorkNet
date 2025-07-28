import en from './en.json';
import es from './es.json';

const messages = (locale) => {
  switch (locale) {
    case 'en-US':
      return en;
    case 'es-ES':
      return es;
    default:
      if (locale.includes('es')) return es;

      return en;
  }
};

export default messages;
