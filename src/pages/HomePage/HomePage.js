import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import RootRef from '@material-ui/core/RootRef';
import Link from '@material-ui/core/Link';

import { Splash } from '../../ot-ui-components';

import HomeBox from './HomeBox';

import Search from '../../components/_Search';
import PortalFeaturesIcon from '../../components/PortalFeaturesIcon';
import ScrollDownButton from '../../components/ScrollDownButton';
import NavBar from '../../components/NavBar/NavBar';

import Version from '../../components/Version';
import Footer from '../../components/Footer';

import { externalLinks, mainMenuItems } from '../../constants';

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
];

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
      marginTop: '12px',
    },
    exampleLink: {
      marginTop: '12px',
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
    scrollDownContainer: {
      position: 'absolute',
      bottom: 0,
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
            justifyContent="center"
            alignItems="center"
          >
            <Splash />
            <NavBar
              name="Genetics"
              items={mainMenuItems}
              search={null}
              homepage
            />
            <HomeBox name="Genetics">
              <Search />
              <Grid
                container
                className={classes.examples}
                justifyContent="space-around"
              >
                {EXAMPLES.map((d, i) => (
                  <Typography
                    key={i}
                    style={{ textAlign: 'center' }}
                    className={classes.exampleLink}
                  >
                    <Link href={d.url} underline="none">
                      {d.label}
                    </Link>
                  </Typography>
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
                Last updated:
              </Typography>
              <Version />
            </HomeBox>
            <Grid
              container
              item
              justifyContent="center"
              className={classes.scrollDownContainer}
            >
              <ScrollDownButton
                className={classes.scrollDown}
                onClick={this.handleScrollDown}
              />
            </Grid>
          </Grid>
        </RootRef>
        <Grid container justifyContent="center">
          <Grid className={classes.list} item md={4}>
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
            <p className={classes.introText}>
              + Browse and rank gene and variant associations identified by our
              Locus-to-Gene (L2G) scoring pipeline
            </p>
            <p className={classes.introText}>
              + Uncover credible sets for variant and trait associations based
              on our fine mapping analyses pipeline
            </p>
            <p className={classes.introText}>
              + Explore and compare studies from UK Biobank, FinnGen, and GWAS
              Catalog using our multi-trait comparison tool
            </p>
          </Grid>
          <Grid container item md={4} justifyContent="center">
            <PortalFeaturesIcon />
          </Grid>
        </Grid>
        <Footer externalLinks={externalLinks} />
      </Fragment>
    );
  }
}

export default withStyles(styles)(HomePage);
