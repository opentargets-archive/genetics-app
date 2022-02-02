import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import { Link, Typography, SectionHeading } from '../../../ot-ui-components';
import {
  commaSeparate,
  variantHasInfo,
  variantGetInfo,
  variantPopulations,
} from '../../../utils';

const VARIANT_SUMMARY_QUERY = loader('./VariantSummary.gql');

const styles = () => ({
  value: {
    paddingLeft: '0.6rem',
    paddingRight: '1rem',
  },
});

function Summary({ classes, variantId }) {
  const { loading, data: queryResult } = useQuery(VARIANT_SUMMARY_QUERY, {
    variables: { variantId },
  });
  const isVariantWithInfo = variantHasInfo(queryResult);
  const data = isVariantWithInfo ? variantGetInfo(queryResult) : {};
  return (
    <>
      <SectionHeading
        heading="Variant summary"
        entities={[
          {
            type: 'variant',
            fixed: true,
          },
        ]}
      />
      <Grid container justifyContent="space-between">
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="subtitle1">Location</Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>GRCh38:</strong> {data.chromosome}:
                {commaSeparate(data.position)}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>GRCh37:</strong> {data.chromosomeB37}:
                {commaSeparate(data.positionB37)}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>Reference allele:</strong> {data.refAllele}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>Alternative allele (effect allele):</strong>{' '}
                {data.altAllele}
              </>
            )}
          </Typography>

          <br />

          <Typography variant="subtitle1">Neighbourhood</Typography>
          {loading && (
            <>
              <Skeleton width="50vw" />
              <Skeleton width="50vw" />
            </>
          )}
          {!loading && data?.nearestGene ? (
            <Typography variant="subtitle2">
              <strong>
                Nearest gene ({commaSeparate(data.nearestGeneDistance)} bp to
                canonical TSS):
              </strong>{' '}
              <Link to={`/gene/${data.nearestGene.id}`}>
                {data.nearestGene.symbol}
              </Link>
            </Typography>
          ) : (
            <Typography variant="subtitle2">
              <strong>Nearest gene:</strong> N/A
            </Typography>
          )}
          {!loading && data?.nearestCodingGene ? (
            <Typography variant="subtitle2">
              <strong>
                Nearest coding gene (
                {commaSeparate(data.nearestCodingGeneDistance)} bp to canonical
                TSS):
              </strong>{' '}
              <Link to={`/gene/${data.nearestCodingGene.id}`}>
                {data.nearestCodingGene.symbol}
              </Link>
            </Typography>
          ) : (
            <Typography variant="subtitle2">
              <strong>Nearest coding gene:</strong> N/A
            </Typography>
          )}
          <br />

          <Typography variant="subtitle1">
            Variant Effect Predictor (
            <Link
              external
              to="https://www.ensembl.org/info/docs/tools/vep/index.html"
            >
              VEP
            </Link>
            )
          </Typography>

          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>Most severe consequence:</strong>{' '}
                {data.mostSevereConsequence
                  ? data.mostSevereConsequence.replace(/_/g, ' ')
                  : 'N/A'}
              </>
            )}
          </Typography>
          <br />

          <Typography variant="subtitle1">
            Combined Annotation Dependent Depletion (
            <Link external to="https://cadd.gs.washington.edu/">
              CADD
            </Link>
            )
          </Typography>
          <Typography variant="subtitle2">
            <strong>raw: </strong>
            <span className={classes.value}>
              {data?.caddRaw ? data.caddRaw.toPrecision(3) : 'N/A'}
            </span>
            <strong>scaled: </strong>
            <span className={classes.value}>
              {data?.caddPhred ? data.caddPhred.toPrecision(3) : 'N/A'}
            </span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle1">
            Population allele frequencies
          </Typography>
          <Grid container>
            {!loading &&
              variantPopulations.map(p => (
                <React.Fragment key={p.code}>
                  <Grid item xs={9}>
                    <Typography variant="subtitle2">{p.description}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="subtitle2" align="right">
                      {data[`gnomad${p.code}`]
                        ? data[`gnomad${p.code}`].toPrecision(3)
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </React.Fragment>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default withStyles(styles)(Summary);
