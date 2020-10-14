import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import RootRef from '@material-ui/core/RootRef';
import Link from '@material-ui/core/Link';

import { Splash, HomeBox, Footer, Button } from 'ot-ui';

import Search from '../components/Search';
import PortalFeaturesIcon from '../components/PortalFeaturesIcon';
import ScrollDownButton from '../components/ScrollDownButton';
import NavBar from '../components/NavBar/NavBar';
import reportAnalyticsEvent from '../analytics/reportAnalyticsEvent';

import { contactUrl, externalLinks } from '../constants';

const EXAMPLES = [
  { label: 'PCSK9', url: '/gene/ENSG00000169174', type: 'gene' },
  {
    label: '1_154453788_C_T',
    url: '/variant/1_154453788_C_T',
    type: 'variant-id',
  },
  { label: 'rs4129267', url: '/variant/1_154453788_C_T', type: 'variant-rsid' },
  {
    label: 'LDL cholesterol (Willer CJ et al. 2013)',
    url: '/study/GCST002222',
    type: 'study',
  },
  {
    label: "Crohn's disease (Liu JZ et al. 2015)",
    url: '/study/GCST003044',
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
      fontFamily: 'Inter',
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
      fontFamily: 'Inter',
      fontSize: '22px',
      fontWeight: 'bold',
    },
    introText: {
      color: theme.palette.grey[800],
      fontFamily: 'Inter',
    },
    list: {
      paddingTop: '44px',
    },
    listText: {
      color: theme.palette.grey[800],
      fontFamily: 'Inter',
      fontSize: '18px',
    },
    linkHeader: {
      marginTop: '22px',
    },
    link: {
      '&:hover': {
        color: theme.palette.primary.dark,
      },
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
              docs="https://genetics-docs.opentargets.org"
              api="https://genetics-docs.opentargets.org/technical-pipeline/graphql-api"
              downloads="https://genetics-docs.opentargets.org/technical-pipeline/data-download"
              contact={contactUrl}
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
              <Typography
                style={{
                  marginTop: '25px',
                }}
                align="center"
              >
                Note: genomic coordinates are based on GRCh38
              </Typography>
              <Typography
                className={classes.linkHeader}
                variant="subtitle2"
                align="center"
              >
                Latest pubication:
              </Typography>
              <Typography style={{ textAlign: 'center' }}>
                <Link
                  underline="none"
                  href="https://doi.org/10.1093/nar/gkaa840"
                  className={classes.link}
                >
                  Open Targets Genetics: systematic identification of
                  trait-associated genes using large-scale genetics and
                  functional genomics
                </Link>
              </Typography>
              <Typography align="center">Ghoussaini, M. et al, 2020</Typography>

              <Typography
                className={classes.linkHeader}
                variant="subtitle2"
                align="center"
              >
                News:
              </Typography>
              <Typography style={{ textAlign: 'center' }}>
                <Link
                  underline="none"
                  href="http://eepurl.com/dHnchn"
                  className={classes.link}
                >
                  Subscribe to our newsletter
                </Link>
              </Typography>
            </HomeBox>
            <Grid container item justify="center">
              <ScrollDownButton
                className={classes.scrollDown}
                onClick={this.handleScrollDown}
              />
            </Grid>
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
              that uses human genetics and genomics data for systematic drug
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
        <Footer externalLinks={externalLinks} />
      </Fragment>
    );
  }
}

export default withStyles(styles)(HomePage);
