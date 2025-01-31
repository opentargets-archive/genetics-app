import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import {
  Link,
  SectionHeading,
  significantFigures,
} from '../../../ot-ui-components';
import { commaSeparate, getData } from '../../../utils';

import STUDY_LOCUS_SUMMARY_QUERY from './StudyLocusSummary.gql';

function Summary({ variantId, studyId }) {
  const { loading, data: queryResult } = useQuery(STUDY_LOCUS_SUMMARY_QUERY, {
    variables: { studyId, variantId },
  });

  if (!loading && !queryResult) {
    return <></>;
  }

  const { studyInfo, variantInfo, pageSummary } = getData(queryResult);

  return (
    <>
      <SectionHeading heading="Association summary" />
      <Grid container>
        <Grid item xs={4}>
          <Typography variant="subtitle1">Study-variant association</Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>P-value:</strong>{' '}
                {significantFigures(pageSummary.pvalMantissa) +
                  'e' +
                  pageSummary.pvalExponent}
              </>
            )}
          </Typography>

          {!loading && pageSummary.beta ? (
            <>
              <Typography variant="subtitle2">
                <strong>Beta:</strong> {significantFigures(pageSummary.beta)}
              </Typography>

              <Typography variant="subtitle2">
                <strong>Beta 95% Confidence Interval:</strong> (
                {significantFigures(pageSummary.betaCILower)},{' '}
                {significantFigures(pageSummary.betaCIUpper)})
              </Typography>
            </>
          ) : !loading && pageSummary.oddsRatio ? (
            <>
              <Typography variant="subtitle2">
                <strong>Odds ratio:</strong>{' '}
                {significantFigures(pageSummary.oddsRatio)}
              </Typography>

              <Typography variant="subtitle2">
                <strong>Odds ratio Confidence Interval:</strong> (
                {significantFigures(pageSummary.oddsRatioCILower)},{' '}
                {significantFigures(pageSummary.oddsRatioCIUpper)})
              </Typography>
            </>
          ) : !loading ? (
            <Typography variant="subtitle2">
              <strong>Beta:</strong> N/A
            </Typography>
          ) : (
            <>
              <Skeleton width="20vw" />
              <Skeleton width="20vw" />
            </>
          )}
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">Study details</Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                {' '}
                <strong>Author:</strong>
                {studyInfo.pubAuthor}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>Year:</strong>{' '}
                {new Date(studyInfo.pubDate).getFullYear()}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>PubMed:</strong>{' '}
                {studyInfo.pmid ? (
                  <Link
                    external
                    to={`https://europepmc.org/abstract/med/${studyInfo.pmid.replace(
                      'PMID:',
                      ''
                    )}`}
                  >
                    {studyInfo.pmid.replace('PMID:', '')}
                  </Link>
                ) : (
                  'NA'
                )}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>Has sumstats:</strong>{' '}
                {studyInfo.hasSumstats ? 'yes' : 'no'}
              </>
            )}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle1">Variant details</Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>GRCh38:</strong>
                {variantInfo.chromosome}:{commaSeparate(variantInfo.position)}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>GRCh37:</strong>
                {variantInfo.chromosomeB37}:
                {commaSeparate(variantInfo.positionB37)}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="20vw" />
            ) : (
              <>
                <strong>RSID:</strong>
                {variantInfo.rsId ? variantInfo.rsId : ' NA'}
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}

export default Summary;
