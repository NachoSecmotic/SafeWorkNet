// /* eslint-disable no-undef */
// import es from './es.json';
// import en from './en.json';

// function iterate(obj, stack, array) {
//   // eslint-disable-next-line no-restricted-syntax
//   for (const property in obj) {
//     // eslint-disable-next-line no-prototype-builtins
//     if (obj.hasOwnProperty(property)) {
//       if (typeof obj[property] === 'object') {
//         iterate(obj[property], `${stack}.${property}`, array);
//       } else {
//         array.push(`${stack.slice(1)}.${property}`);
//       }
//     }
//   }

//   return array;
// }

// describe('i18n', () => {
//   test('Translations keys are the same for every language', () => {
//     const translationKeysEs = iterate(es, '', []);
//     const translationKeysEn = iterate(en, '', []);

//     expect(translationKeysEs).toEqual(translationKeysEn);
//   });
// });
