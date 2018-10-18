import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import RootRef from '@material-ui/core/RootRef';

import { Splash, HomeBox, Footer, Button, NavBar } from 'ot-ui';

import Search from '../components/Search';
import PortalFeaturesIcon from '../components/PortalFeaturesIcon';
import ScrollDownButton from '../components/ScrollDownButton';
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
    slogan: {
      color: theme.palette.grey[700],
      fontFamily: 'Roboto',
      fontSize: '18px',
      marginBottom: '15px',
      textAlign: 'center',
    },
    examples: {
      marginTop: '25px',
    },
    exampleLink: {
      textDecoration: 'none',
      marginRight: '15px',
    },
    scrollDown: {
      position: 'absolute',
      bottom: '10px',
    },
    introTitle: {
      color: theme.palette.grey[700],
      fontFamily: 'Roboto',
      fontSize: '22px',
      fontWeight: 'bold',
    },
    introText: {
      color: theme.palette.grey[800],
      fontFamily: 'Roboto',
    },
    list: {
      paddingTop: '44px',
    },
    listText: {
      color: theme.palette.grey[800],
      fontFamily: 'Roboto',
      fontSize: '18px',
    },
  };
};

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.searchSectionRef = React.createRef();
  }

  handleScrollDown = () => {
    const node = this.searchSectionRef.current;
    const rect = node.getBoundingClientRect();
    window.scrollTo({ top: rect.height, left: 0, behavior: 'smooth' });
  };

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <Helmet>
          <title>Open Targets Genetics</title>
        </Helmet>
        <RootRef rootRef={this.searchSectionRef}>
          <Grid
            className={classes.searchSection}
            container
            justify="center"
            alignItems="center"
          >
            <Splash />
            <NavBar
              name={null}
              search={null}
              homepage
              docs="https://opentargets.gitbook.io/open-targets-genetics-documentation"
              contact="mailto:geneticsportal@opentargets.org"
            />
            <HomeBox name="Genetics">
              <div className={classes.slogan}>
                Explore{' '}
                <span className={classes.highlight}>variant-gene-trait</span>{' '}
                associations from UK Biobank and GWAS Catalog
              </div>
              <Search />
              <Grid container justify="center" className={classes.examples}>
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
              </Grid>
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
            <ScrollDownButton
              className={classes.scrollDown}
              onClick={this.handleScrollDown}
            />
          </Grid>
        </RootRef>
        <Grid container justify="center">
          <Grid item md={8}>
            <p className={classes.introTitle}>
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
        </Grid>
        <Grid container justify="center">
          <Grid className={classes.list} item md={4}>
            <p className={classes.listText}>
              + Browse and rank gene and variant associations identified by our{' '}
              <span className={classes.highlight}>
                Variant-to-Gene (V2G) scoring
              </span>{' '}
              pipeline
            </p>
            <p className={classes.listText}>
              + Uncover credible sets for variant and trait associations based
              on our{' '}
              <span className={classes.highlight}>fine mapping analyses</span>{' '}
              pipeline
            </p>
            <p className={classes.listText}>
              + Explore and compare studies from both UK Biobank and GWAS
              Catalog using our{' '}
              <span className={classes.highlight}>multi-trait comparison</span>{' '}
              tool
            </p>
          </Grid>
          <Grid container item md={4} justify="center">
            <PortalFeaturesIcon />
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
  }
}

export default withStyles(styles)(HomePage);
