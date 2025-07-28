export const KEYCLOAK_REALM_ID = window._env_.REACT_APP_KEYCLOAK_REALM_ID;
export const KEYCLOAK_CLIENT_ID = window._env_.REACT_APP_KEYCLOAK_CLIENT_ID;
export const KEYCLOAK_CLIENT_SECRET = window._env_.REACT_APP_KEYCLOAK_CLIENT_SECRET;
export const KEYCLOAK_URL = window._env_.REACT_APP_KEYCLOAK_URL;
export const COMPLETE_KEYCLOAK_URL_TOKEN = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM_ID}/protocol/openid-connect/token`;
export const COMPLETE_KEYCLOAK_URL_LOGOUT = `${KEYCLOAK_URL}/realms/${KEYCLOAK_CLIENT_ID}/protocol/openid-connect/logout`;
