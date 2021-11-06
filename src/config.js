const config = {
  apiUrl:
    window.configApiUrl ??
    'https://open-targets-genetics-dev.ew.r.appspot.com/graphql',
  // apiUrl: window.configApiUrl ?? 'https://api.genetics.opentargets.org/graphql',
  googleTagManagerID: window.configGoogleTagManagerID ?? null,
};

export default config;
