import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Grid, Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme, withStyles, makeStyles } from '@material-ui/core/styles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faDownload,
  faLaptopCode,
  faQuestionCircle,
  faFileAlt,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import Link from '../../components/Link';
import Search from '../../components/Search';
import ScrollDownButton from '../../components/ScrollDownButton';
import NavBar from '../../components/NavBar/NavBar';
import Version from '../../components/Version';
import Footer from '../../components/Footer';
import { Splash } from '../../ot-ui-components';

import HomeBox from './HomeBox';

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

const containerStyles = theme => {
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
    hpSection: {
      marginBottom: '40px',
      marginTop: '60px',
    },
    linksContainer: {
      marginTop: '15px',
      marginBottom: '15px',
    },
  };
};

const useHelpBoxStyle = makeStyles(theme => ({
  baseLink: {
    whiteSpace: 'pre-wrap',
  },
  helpBoxes: {
    maxWidth: '120px',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      textAlign: 'left',
    },
  },
}));

const HelpBoxPanel = ({ fai, url, label, external }) => {
  const theme = useTheme();
  const xsMQ = useMediaQuery(theme.breakpoints.down('xs'));
  const classes = useHelpBoxStyle();
  if (xsMQ) {
    // on xsmall screens
    return (
      <Link to={url} external={external} className={classes.baseLink}>
        <Grid container wrap="nowrap" alignItems="center" spacing={1}>
          <Grid item>
            <div className="fa-layers fa-fw fa-3x">
              <FontAwesomeIcon icon={faCircle} />
              <FontAwesomeIcon icon={fai} transform="shrink-8" inverse />
            </div>
          </Grid>
          <Grid item>
            <Typography display="inline" wrap>
              {label}
            </Typography>
          </Grid>
        </Grid>
      </Link>
    );
  }
  return (
    <Box className={classes.helpBoxes}>
      <Link to={url} external={external} className={classes.baseLink}>
        <div className="fa-layers fa-fw fa-6x">
          <FontAwesomeIcon icon={faCircle} />
          <FontAwesomeIcon icon={fai} transform="shrink-8" inverse />
        </div>
        <Typography wrap>{label}</Typography>
      </Link>
    </Box>
  );
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
        <main ref={this.searchSectionRef}>
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
                    <Link to={d.url} underline="none">
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
        </main>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          direction="column"
          className={classes.hpSection}
        >
          <Grid item xs={10} md={10}>
            <Typography variant="h4" component="h1" align="center" paragraph>
              Get started with the Genetics Portal
            </Typography>

            <Grid
              container
              justifyContent="space-evenly"
              alignItems="flex-start"
              spacing={5}
              className={classes.linksContainer}
            >
              <Grid item xs={12} sm={'auto'}>
                <HelpBoxPanel
                  fai={faDownload}
                  url="https://genetics-docs.opentargets.org/data-access/data-download"
                  label="Download all of our open datasets"
                  external
                />
              </Grid>
              <Grid item xs={12} sm={'auto'}>
                <HelpBoxPanel
                  fai={faLaptopCode}
                  url="https://genetics-docs.opentargets.org/data-access/graphql-api"
                  label="Access data with our GraphQL API"
                  external
                />
              </Grid>

              <Grid item xs={12} sm={'auto'}>
                <HelpBoxPanel
                  fai={faQuestionCircle}
                  url="https://genetics-docs.opentargets.org/"
                  label="Check out our Platform documentation"
                  external
                />
              </Grid>

              <Grid item xs={12} sm={'auto'}>
                <HelpBoxPanel
                  fai={faFileAlt}
                  url="https://genetics-docs.opentargets.org/citation"
                  label="Read our latest Platform publications"
                  external
                />
              </Grid>

              <Grid item xs={12} sm={'auto'}>
                <HelpBoxPanel
                  fai={faCommentDots}
                  url="https://community.opentargets.org/"
                  label="Join the Open Targets Community"
                  external
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Footer externalLinks={externalLinks} />
      </Fragment>
    );
  }
}

export default withStyles(containerStyles)(HomePage);
