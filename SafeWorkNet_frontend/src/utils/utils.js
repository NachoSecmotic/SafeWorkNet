/* eslint-disable no-bitwise */

export function translationsCodeStatusLogin(code) {
  switch (code) {
    case 401:
      return 'login.error.auth';
    case 404:
      return 'login.error.notFound';
    default:
      return 'Error en el servidor. Inténtelo más tarde';
  }
}

export function redirectTo(path) {
  const { origin } = window.location;
  window.location = `${origin}/${path}`;
}

export function transformParamsToPath(params) {
  return Object.entries(params).reduce((path, [key, value], indx) => `${path}${indx === 0 ? '?' : '&'}${key}=${value}`, '');
}

export function checkAuthorization(codeError) {
  if (codeError === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const formatLocation = (location = {}) => (location?.coordinates?.length ? [...location.coordinates].reverse().join(',') : undefined);

export const CollapseLocation = (location = {}) => location?.coordinates?.some((coord) => {
  const coordString = coord.toString();
  const decimalPart = coordString.split('.')[1];
  return decimalPart && decimalPart.length > 3;
});

export const getHash = (string) => {
  let hash = 0;
  string.split('').forEach((char, i) => {
    const character = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + character;
    hash &= hash;
  });
  return hash;
};
