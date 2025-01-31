import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useQuery } from '@apollo/client';
import { Skeleton } from '@material-ui/lab';
import { Typography, SectionHeading } from '../../../ot-ui-components';
import Link from '../../../components/Link';

import { commaSeparate, studyHasInfo, studyGetInfo } from '../../../utils';

import STUDY_SUMMARY_QUERY from './StudySummaryQuery.gql';

const StudySummary = ({ studyId }) => {
  const { loading, data: queryResult } = useQuery(STUDY_SUMMARY_QUERY, {
    variables: { studyId },
  });
  const isVariantWithInfo = studyHasInfo(queryResult);
  const data = isVariantWithInfo ? studyGetInfo(queryResult) : {};
  return (
    <>
      <SectionHeading
        heading="Study summary"
        entities={[
          {
            type: 'study',
            fixed: true,
          },
        ]}
      />

      <Grid container justifyContent="space-between">
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="subtitle1">Details</Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>Author:</strong> {data.pubAuthor}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>Year:</strong> {new Date(data.pubDate).getFullYear()}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>PubMed: </strong>
                {data.pmid ? (
                  <Link
                    external
                    to={`https://europepmc.org/abstract/med/${data.pmid.replace(
                      'PMID:',
                      ''
                    )}`}
                  >
                    {data.pmid.replace('PMID:', '')}
                  </Link>
                ) : (
                  ' NA'
                )}
              </>
            )}
          </Typography>
          <Typography variant="subtitle2">
            {loading ? (
              <Skeleton width="50vw" />
            ) : (
              <>
                <strong>Has summary stats:</strong>{' '}
                {data.hasSumstats ? 'Yes' : 'No'}
              </>
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle1">Study size</Typography>
          {loading ? (
            <>
              <Skeleton width="30vw" />
              <Skeleton width="30vw" />
              <Skeleton width="30vw" />
            </>
          ) : (
            <Grid container>
              {[
                { label: 'N Study', value: data.nInitial },
                { label: 'N Replication', value: data.nReplication },
                { label: 'N Cases', value: data.nCases },
              ].map((d, i) => (
                <React.Fragment key={i}>
                  <Grid item xs={9}>
                    <Typography variant="subtitle2">{d.label}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="subtitle2" align="right">
                      {d.value ? commaSeparate(d.value) : 'NA'}
                    </Typography>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default StudySummary;
