import React, { Fragment } from 'react';
import { Helmet } from 'react-helmet';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';

import { Splash, HomeBox, Footer } from 'ot-ui';

import Search from '../components/Search';
import PortalFeaturesIcon from '../components/PortalFeaturesIcon';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

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
  return {
    highlight: {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
    },
    searchSection: {
      position: 'relative',
      height: '100vh',
    },
  };
};

const HomePage = ({ classes }) => (
  <Fragment>
    <Helmet>
      <title>Open Targets Genetics</title>
    </Helmet>
    <Grid className={classes.searchSection} container justify="center">
      <Splash />
      <Grid item>hello</Grid>
    </Grid>
    <Grid container justify="center">
      <Grid item md={8}>
        <Grid container>
          <Grid item md={12}>
            <Typography variant="headline">
              Welcome to Open Targets Genetics
            </Typography>
            <Typography paragraph>
              Open Targets Genetics is the latest release from Open Targets, an
              innovative, large-scale, multi-year, public-private partnership
              that uses human genetics and genmics data for systematic drug
              target identification and prioritisation.
            </Typography>
            <Typography paragraph>
              The Portal offers three unique features to help you discover
              associations between genes, variants, and traits:
            </Typography>
          </Grid>
          <Grid item md={6}>
            <Typography paragraph>
              + Browse and rank gene and variant associations identified by our{' '}
              <span className={classes.highlight}>
                Gene2Variant (g2v) scoring
              </span>{' '}
              pipeline
            </Typography>
            <Typography paragraph>
              + Uncover credible sets for variant and trait associations based
              on our{' '}
              <span className={classes.highlight}>fine mapping analyses</span>{' '}
              pipeline
            </Typography>
            <Typography paragraph>
              + Explore and compare studies from both UK Biobank and GWAS
              Catalog using our{' '}
              <span className={classes.highlight}>multi-trait comparison</span>{' '}
              tool
            </Typography>
          </Grid>
          <Grid item md={6}>
            <PortalFeaturesIcon />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Fragment>
);

export default withStyles(styles)(HomePage);
