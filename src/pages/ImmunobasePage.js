import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { Link, Button } from '../ot-ui-components';

import BasePage from './BasePage';

const styles = () => {
  return {
    information: {
      height: '100%',
    },
  };
};

const ImmunobasePage = ({ classes }) => (
  <BasePage>
    <Grid
      className={classes.information}
      container
      justify="center"
      alignItems="center"
    >
      <Grid item xs={12} sm={10} md={6}>
        <Typography align="center">
          <img src="immunobase.svg" alt="Immunobase Logo" />
          <p>
            ImmunoBase ownership has been transferred to{' '}
            <Link external to="https://www.opentargets.org/">
              Open Targets
            </Link>
            .
          </p>
          <p>
            Results for all publicly available GWAS, including ImmunoBase
            studies, can be explored using{' '}
            <Link to="/">Open Targets Genetics</Link>. You can search by{' '}
            <Link to="/study/GCST005536">study</Link>,{' '}
            <Link to="/variant/2_203874196_G_A">variant</Link> or{' '}
            <Link to="/gene/ENSG00000162594">gene</Link> to find
            trait-associated loci and prioritise genes using our{' '}
            <Link
              external
              to="https://genetics-docs.opentargets.org/our-approach/data-pipeline"
            >
              variant-to-gene
            </Link>{' '}
            and{' '}
            <Link
              external
              to="https://genetics-docs.opentargets.org/our-approach/colocalisation-analysis"
            >
              colocalisation
            </Link>{' '}
            pipelines.
          </p>
          <p>
            Summary statistics and curated data previously hosted by ImmunoBase
            can now be downloaded from the{' '}
            <Link external to="https://www.ebi.ac.uk/gwas/">
              NHGRI-EBI GWAS Catalog
            </Link>{' '}
            (see below for links).
          </p>
          <p>
            <Button variant="outlined">
              <Link
                external
                to="https://docs.google.com/spreadsheets/d/1YYbxC1NhtbYuBYe2gYZNcxO0a0S4oTxHfoYtZrqKsrM/edit#gid=1589938306"
              >
                Immunobase study links
              </Link>
            </Button>
          </p>
        </Typography>
      </Grid>
    </Grid>
  </BasePage>
);

export default withStyles(styles)(ImmunobasePage);
