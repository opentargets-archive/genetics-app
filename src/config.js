const config = {
  apiUrl:
    window.configApiUrl ??
    'https://open-targets-genetics-dev.ew.r.appspot.com/graphql',
  googleTagManagerID: window.configGoogleTagManagerID ?? null,
  helpdeskEmail: window.configHelpdeskEmail ?? 'helpdesk@opentargets.org',
  profile: window.configProfile ?? {},
  platformUrl: window.configPlatformUrl ?? 'https://platform.opentargets.org/',
};

export default config;
