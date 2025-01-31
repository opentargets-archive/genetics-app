import React from 'react';
import { faDna } from '@fortawesome/free-solid-svg-icons';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useQuery } from '@apollo/client';
import { Link as RouterLink } from 'react-router-dom';

import BaseHeader, { OTButtonLink } from '../../components/Header';
import { ExternalLink } from '../../components/ExternalLink';
import { SectionHeading } from '../../ot-ui-components';
import {
  parseGeneDescription,
  parseGeneLocation,
  parseGeneBioType,
  getGeneLocusURL,
} from '../../utils';

import GENE_HEADER_QUERY from './GeneHeader.gql';

const useStyles = makeStyles((theme) => ({
  sectionContainer: {
    marginBottom: '20px',
    '& span': {
      display: 'block',
    },
  },
  label: {
    marginBottom: '5px',
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
}));

function Header({ geneId }) {
  const classes = useStyles();
  const { loading, data } = useQuery(GENE_HEADER_QUERY, {
    variables: { geneId },
  });

  const geneInfo = data?.geneInfo;
  const id = geneInfo?.id;
  const symbol = geneInfo?.symbol;
  const description = parseGeneDescription(geneInfo?.description);
  const location = parseGeneLocation(
    geneInfo?.chromosome,
    geneInfo?.start,
    geneInfo?.end
  );
  const bioType = parseGeneBioType(geneInfo?.bioType);
  const locusParams = {
    chromosome: geneInfo?.chromosome,
    start: geneInfo?.start,
    end: geneInfo?.end,
    selectedGene: id,
  };
  const locusURL = getGeneLocusURL(locusParams);

  return (
    <>
      <BaseHeader
        title={symbol}
        loading={loading}
        Icon={faDna}
        subtitle={description}
        externalLinks={
          <>
            <ExternalLink
              title="Ensembl"
              url={`https://identifiers.org/ensembl:${id}`}
              id={id}
            />
            <ExternalLink
              title="gnomAD"
              url={`http://gnomad.broadinstitute.org/gene/${id}`}
              id={id}
            />
            <ExternalLink
              title="GTEx"
              url={`https://identifiers.org/gtex:${symbol}`}
              id={symbol}
            />
            <ExternalLink
              title="GeneCards"
              url={`https://identifiers.org/genecards:${symbol}`}
              id={symbol}
            />
          </>
        }
      >
        {!loading && <OTButtonLink symbol={symbol} id={id} />}
      </BaseHeader>
      <SectionHeading
        heading="Gene summary"
        entities={[
          {
            type: 'gene',
            fixed: true,
          },
        ]}
      />
      <Grid>
        <div className={classes.sectionContainer}>
          <Typography className={classes.label}>Location</Typography>
          <span>
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <b>GRCh38:</b> {location} (
                <RouterLink className={classes.link} to={locusURL}>
                  view locus
                </RouterLink>
                )
              </>
            )}
          </span>
        </div>
        <div className={classes.sectionContainer}>
          <Typography className={classes.label}>BioType</Typography>
          {loading ? (
            <Skeleton width="50vw" />
          ) : (
            <>
              <b>Type:</b> {bioType}
            </>
          )}
        </div>
      </Grid>
    </>
  );
}

export default Header;
