export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082',
  oidcIssuer: 'http://localhost:8080/realms/tena-dev',
  oidcClientId: 'tena-provider',
  oidcRedirectUri: 'http://localhost:4201/callback',
  oidcScope: 'openid profile email',
  appName: 'TenaDigital Provider',
};
