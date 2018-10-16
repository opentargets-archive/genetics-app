import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import { Splash, HomeBox, Footer, Button } from 'ot-ui';

import Search from '../components/Search';
import PortalFeaturesIcon from '../components/PortalFeaturesIcon';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

import pkg from '../../package.json';

const EXAMPLES = [
  { label: 'PCSK9', url: '/gene/ENSG00000169174', type: 'gene' },
  {
    label: '1_154426264_C_T',
    url: '/variant/1_154426264_C_T',
    type: 'variant-id',
  },
  { label: 'rs4129267', url: '/variant/1_154426264_C_T', type: 'variant-rsid' },
  {
    label: "Crohn's disease (de Lange KM et al. 2017)",
    url: '/study/GCST004132',
    type: 'study',
  },
];

const clickExample = type => () => {
  reportAnalyticsEvent({
    category: 'home-example',
    action: 'click',
    label: type,
  });
};

const styles = theme => {
  console.log('theme', theme);
  return {
    highlight: {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
    },
    searchSection: {
      position: 'relative',
      height: '100vh',
      overflow: 'visible',
    },
    exampleLink: {
      textDecoration: 'none',
      marginRight: '15px',
    },
    introText: {
      fontFamily: 'Roboto',
      color: theme.palette.grey[800],
    },
    description: {
      paddingTop: '44px',
    },
    welcomeTitle: {
      fontFamily: 'Roboto',
      fontWeight: 'bold',
      fontSize: '22px',
      color: theme.palette.grey[700],
    },
    welcomeText: {
      fontFamily: 'Roboto',
      fontSize: '18px',
      color: theme.palette.grey[800],
    },
  };
};

const HomePage = ({ classes }) => (
  <Fragment>
    <Helmet>
      <title>Open Targets Genetics</title>
    </Helmet>
    <Grid
      className={classes.searchSection}
      container
      justify="center"
      alignItems="center"
    >
      <Splash />
      <HomeBox name="Genetics">
        <Search />
        <Typography style={{ marginTop: '25px' }}>Examples:</Typography>
        <div>
          {EXAMPLES.map((d, i) => (
            <a
              className={classes.exampleLink}
              key={i}
              href={d.url}
              onClick={clickExample(d.type)}
            >
              <Button variant="outlined">{d.label}</Button>
            </a>
          ))}
        </div>
        <Typography style={{ marginTop: '25px', textAlign: 'center' }}>
          <a
            href="http://eepurl.com/dHnchn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe to our newsletter
          </a>
        </Typography>
      </HomeBox>
    </Grid>
    <Grid container justify="center">
      <Grid item md={8}>
        <Grid container>
          <Grid item md={12}>
            <p className={classes.welcomeTitle}>
              Welcome to Open Targets Genetics
            </p>
            <p className={classes.introText}>
              Open Targets Genetics is the latest release from Open Targets, an
              innovative, large-scale, multi-year, public-private partnership
              that uses human genetics and genmics data for systematic drug
              target identification and prioritisation.
            </p>
            <p className={classes.introText}>
              The Portal offers three unique features to help you discover
              associations between genes, variants, and traits:
            </p>
          </Grid>
          <Grid className={classes.description} item md={6}>
            <p className={classes.welcomeText}>
              + Browse and rank gene and variant associations identified by our{' '}
              <span className={classes.highlight}>
                Gene2Variant (g2v) scoring
              </span>{' '}
              pipeline
            </p>
            <p className={classes.welcomeText}>
              + Uncover credible sets for variant and trait associations based
              on our{' '}
              <span className={classes.highlight}>fine mapping analyses</span>{' '}
              pipeline
            </p>
            <p className={classes.welcomeText}>
              + Explore and compare studies from both UK Biobank and GWAS
              Catalog using our{' '}
              <span className={classes.highlight}>multi-trait comparison</span>{' '}
              tool
            </p>
          </Grid>
          <Grid item md={6}>
            <Grid container justify="center">
              <PortalFeaturesIcon />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    <Footer
      version={pkg.version}
      commitHash={
        process.env.REACT_APP_REVISION
          ? process.env.REACT_APP_REVISION
          : '2222ccc'
      }
      githubUrl="https://github.com/opentargets/genetics-app"
    />
  </Fragment>
);

export default withStyles(styles)(HomePage);
