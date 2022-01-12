import React from 'react';
import Grid from '@material-ui/core/Grid';

import { Link, Typography, commaSeparate } from '../ot-ui-components';

const StudySummary = ({ pmid, nInitial, nReplication, nCases, studyId }) => (
  <Grid container justifyContent="space-between">
    <Grid item xs={12} sm={6} md={8}>
      <Typography variant="subtitle1">External references</Typography>
      {studyId && studyId.startsWith('NEALE2') ? (
        <Typography variant="subtitle2">
          <strong>UK Biobank:</strong>{' '}
          <Link
            external
            to={`http://biobank.ndph.ox.ac.uk/showcase/field.cgi?id=${
              studyId.split('_')[1]
            }`}
          >
            {studyId.split('_')[1]}
          </Link>
        </Typography>
      ) : null}
      {studyId && studyId.startsWith('SAIGE') ? (
        <Typography variant="subtitle2">
          <strong>SAIGE:</strong>{' '}
          <Link external to="https://www.leelabsg.org/resources">
            Homepage
          </Link>
        </Typography>
      ) : null}
      {studyId && studyId.startsWith('GCST') ? (
        <Typography variant="subtitle2">
          <strong>GWAS Catalog:</strong>{' '}
          <Link
            external
            to={`https://www.ebi.ac.uk/gwas/studies/${studyId.replace(
              /_\d+/,
              ''
            )}`}
          >
            {studyId.replace(/_\d+/, '')}
          </Link>
        </Typography>
      ) : null}
      {studyId && studyId.startsWith('FINNGEN') ? (
        <Typography variant="subtitle2">
          <strong>FinnGen</strong>{' '}
          <Link
            external
            to={`https://r5.finngen.fi/pheno/${studyId.slice(11)}`}
          >
            {studyId.slice(11)}
          </Link>
        </Typography>
      ) : null}
      {pmid ? (
        <Typography variant="subtitle2">
          <strong>PubMed ID:</strong>{' '}
          <Link
            external
            to={`https://europepmc.org/abstract/med/${pmid.replace(
              'PMID:',
              ''
            )}`}
          >
            {pmid.replace('PMID:', '')}
          </Link>
        </Typography>
      ) : null}
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle1">Study size</Typography>
      <Grid container>
        {[
          { label: 'N Study', value: nInitial },
          { label: 'N Replication', value: nReplication },
          { label: 'N Cases', value: nCases },
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
    </Grid>
  </Grid>
);

export default StudySummary;
