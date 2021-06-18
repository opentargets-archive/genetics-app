import { contactUrl as contactUrlConfig } from './configuration';

export const pvalThreshold = 4.94e-322;

export const contactUrl = contactUrlConfig;

export const externalLinks = {
  about: [
    {
      label: `Data version 21.06`,
      url: `https://genetics-docs.opentargets.org/release-notes`,
    },
    {
      label: 'Community forum',
      url: 'https://community.opentargets.org/',
    },
    {
      label: 'Privacy notice',
      url: 'https://www.ebi.ac.uk/data-protection/privacy-notice/open-targets',
    },
    {
      label: 'Terms of use',
      url: `https://genetics-docs.opentargets.org/terms-of-use`,
    },
  ],
  network: [
    { label: 'Science', url: 'https://www.opentargets.org/science' },
    { label: 'Publications', url: 'https://www.opentargets.org/publications' },
    { label: 'Platform', url: 'https://platform.opentargets.org/' },
    { label: 'Jobs', url: 'https://www.opentargets.org/jobs' },
    { label: 'Blog', url: 'https://blog.opentargets.org' },
  ],
  partners: [
    { label: 'Bristol Myers Squibb', url: 'https://www.bms.com' },
    { label: 'EMBL-EBI', url: 'http://www.ebi.ac.uk' },
    { label: 'GSK', url: 'http://www.gsk.com' },
    { label: 'Sanofi', url: 'https://www.sanofi.com' },
    { label: 'Wellcome Sanger Institute', url: 'http://www.sanger.ac.uk' },
  ],
  help: [
    {
      label: 'Documentation',
      iconClasses: 'fa fa-question-circle',
      url: 'https://genetics-docs.opentargets.org',
    },
    {
      label: 'Contact',
      iconClasses: 'fa fa-envelope',
      url: `${contactUrl}`,
    },
  ],
  social: [
    {
      iconClasses: 'fab fa-discourse',
      url: 'https://community.opentargets.org/',
    },
    {
      iconClasses: 'fab fa-twitter-square',
      url: 'http://twitter.com/opentargets',
    },
    {
      iconClasses: 'fab fa-linkedin',
      url: 'https://www.linkedin.com/company/open-targets/',
    },
    {
      iconClasses: 'fab fa-youtube-square',
      url: 'https://www.youtube.com/opentargets',
    },
    {
      iconClasses: 'fab fa-github-square',
      url: 'https://github.com/opentargets',
    },
  ],
};
