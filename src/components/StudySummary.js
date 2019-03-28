import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';

import { Typography, commaSeparate } from 'ot-ui';

const styles = () => ({
  tooltipIcon: {
    fontSize: '1.2rem',
    paddingLeft: `0.6rem`,
  },
  valueWithBadgedLabel: {
    verticalAlign: 'middle',
    paddingLeft: '0.6rem',
    paddingRight: '1rem',
  },
  value: {
    paddingLeft: '0.6rem',
    paddingRight: '1rem',
  },
  cardContent: {
    padding: '8px !important',
  },
  externalLinkIcon: {
    fontSize: '0.7rem',
    verticalAlign: 'middle',
    marginLeft: '3px',

    width: '1rem',
    height: '1rem',
  },
});

const StudySummary = ({
  classes,
  pubAuthor,
  pubDate,
  pubJournal,
  pmid,
  nInitial,
  nReplication,
  nCases,
  studyId,
}) => (
  <Grid container justify="space-between">
    <Grid item xs={12} sm={6} md={8}>
      <Typography variant="subtitle1">External references</Typography>
      {studyId && studyId.startsWith('NEALEUKB') ? (
        <Typography variant="subtitle2">
          <strong>Neale UK Biobank:</strong>{' '}
          <a
            href="http://www.nealelab.is/uk-biobank"
            target="_blank"
            rel="noopener noreferrer"
          >
            Homepage
            <Icon
              className={classNames(
                'fa',
                'fa-external-link-alt',
                classes.externalLinkIcon
              )}
            />
          </a>
        </Typography>
      ) : null}
      {studyId && studyId.startsWith('GCST') ? (
        <Typography variant="subtitle2">
          <strong>GWAS Catalog:</strong>{' '}
          <a
            href={`https://www.ebi.ac.uk/gwas/studies/${studyId.replace(
              /_\d+/,
              ''
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {studyId.replace(/_\d+/, '')}
            <Icon
              className={classNames(
                'fa',
                'fa-external-link-alt',
                classes.externalLinkIcon
              )}
            />
          </a>
        </Typography>
      ) : null}
      {pmid ? (
        <Typography variant="subtitle2">
          <strong>PubMed ID:</strong>{' '}
          <a
            href={`https://europepmc.org/abstract/med/${pmid.replace(
              'PMID:',
              ''
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pmid.replace('PMID:', '')}
            <Icon
              className={classNames(
                'fa',
                'fa-external-link-alt',
                classes.externalLinkIcon
              )}
            />
          </a>
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

export default withStyles(styles)(StudySummary);
