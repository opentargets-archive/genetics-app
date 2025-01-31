import { faBook, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import {
  faDiscourse,
  faTwitterSquare,
  faLinkedin,
  faGithubSquare,
  faYoutubeSquare,
} from '@fortawesome/free-brands-svg-icons';

import { contactUrl as contactUrlConfig } from './configuration';
import config from './config';

export const pvalThreshold = 4.94e-322;

export const contactUrl = contactUrlConfig;

export const naLabel = 'N/A';

export const mainMenuItems = [
  // Documentation
  {
    name: 'Documentation',
    url: 'https://genetics-docs.opentargets.org',
    external: true,
  },
  // Data downloads
  {
    name: 'Data downloads',
    url: 'https://genetics-docs.opentargets.org/data-access/data-download',
    external: true,
  },
  // API
  // TODO: update config
  {
    name: 'API',
    url: '/api',
    // url: config.apiUrl.split('/graphql')[0],
    external: false,
  },
  // Community
  {
    name: 'Community',
    url: 'https://community.opentargets.org/',
    external: true,
  },
];

export const externalLinks = {
  about: [
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
  license: {
    label: 'Open Targets Genetics',
    url: 'https://genetics.opentargets.org/',
  },
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
    { label: 'Genentech', url: 'https://www.gene.com' },
    { label: 'GSK', url: 'http://www.gsk.com' },
    { label: 'Pfizer', url: 'https://pfizer.com/' },
    { label: 'Sanofi', url: 'https://www.sanofi.com' },
    { label: 'Wellcome Sanger Institute', url: 'http://www.sanger.ac.uk' },
  ],
  help: [
    {
      label: 'Documentation',
      icon: faBook,
      url: 'https://genetics-docs.opentargets.org',
    },
    {
      label: 'Community',
      icon: faDiscourse,
      url: 'https://community.opentargets.org',
      external: true,
    }
  ],
  social: [
    { icon: faTwitterSquare, url: 'https://twitter.com/opentargets' },
    { icon: faLinkedin, url: 'https://www.linkedin.com/company/open-targets' },
    { icon: faYoutubeSquare, url: 'https://www.youtube.com/opentargets' },
    { icon: faGithubSquare, url: 'https://github.com/opentargets' },
  ],
};
