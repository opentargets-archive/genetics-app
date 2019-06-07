import {
  contactUrl as contactUrlConfig,
  gitRevision,
  packageVersion,
  platformUrl,
} from './configuration';

export const pvalThreshold = 4.94e-322;

export const contactUrl = contactUrlConfig;

export const externalLinks = {
  about: [
    {
      label: `Version ${packageVersion} (${gitRevision})`,
      url: `https://github.com/opentargets/genetics-app/commit/${gitRevision}`,
    },
    {
      label: 'Github codebase',
      url: 'https://github.com/opentargets/genetics-app',
    },
    {
      label: 'Privacy notice',
      url: 'https://www.ebi.ac.uk/data-protection/privacy-notice/open-targets',
    },
    {
      label: 'Terms of use',
      url: `${platformUrl}/terms-of-use`,
    },
  ],
  network: [
    {
      label: 'Overview',
      url: 'https://www.opentargets.org',
    },
    { label: 'Science', url: 'https://www.opentargets.org/science' },
    { label: 'Resources', url: 'https://www.opentargets.org/resources' },
    { label: 'Blog', url: 'https://blog.opentargets.org' },
  ],
  partners: [
    { label: 'Biogen', url: 'https://www.biogen.com' },
    { label: 'Celgene', url: 'http://www.celgene.com' },
    { label: 'EMBL-EBI', url: 'http://www.ebi.ac.uk' },
    { label: 'GSK', url: 'http://www.gsk.com' },
    { label: 'Takeda', url: 'https://www.takeda.com' },
    {
      label: 'Wellcome Sanger Institute',
      url: 'http://www.sanger.ac.uk',
    },
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
      iconClasses: 'fab fa-facebook',
      url: 'https://www.facebook.com/OpenTargets',
    },
    {
      iconClasses: 'fab fa-twitter-square',
      url: 'http://twitter.com/targetvalidate',
    },
    {
      iconClasses: 'fab fa-linkedin',
      url:
        'https://www.linkedin.com/company/centre-for-therapeutic-target-validation',
    },
    {
      iconClasses: 'fab fa-youtube-square',
      url: 'https://www.youtube.com/channel/UCLMrondxbT0DIGx5nGOSYOQ',
    },
    { iconClasses: 'fab fa-medium', url: 'https://medium.com/opentargets' },
    {
      iconClasses: 'fab fa-github-square',
      url: 'https://github.com/opentargets',
    },
  ],
};
