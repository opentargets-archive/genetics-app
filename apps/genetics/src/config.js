const config = {
  apiUrl:
  window.configApiUrl ?? 'https://api.genetics.opentargets.org/graphql',
    // window.configApiUrl ?? 'https://api.genetics.dev.opentargets.xyz/graphql',
  googleTagManagerID: window.configGoogleTagManagerID ?? null,
  helpdeskEmail: window.configHelpdeskEmail ?? 'helpdesk@opentargets.org',
  profile: window.configProfile ?? {},
  platformUrl: window.configPlatformUrl
    ? window.configPlatformUrl.replace(/\/$/, '')
    : 'https://platform.opentargets.org',
};

export default config;
