import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';

import { Typography, commaSeparate } from 'ot-ui';

const populations = [
  { code: 'AFR', description: 'African/African-American' },
  { code: 'AMR', description: 'Latino/Admixed American' },
  { code: 'ASJ', description: 'Ashkenazi Jewish' },
  { code: 'EAS', description: 'East Asian' },
  { code: 'FIN', description: 'Finnish' },
  { code: 'NFE', description: 'Non-Finnish European' },
  { code: 'NFEEST', description: 'Non-Finnish Eurpoean Estonian' },
  {
    code: 'NFENWE',
    description: 'Non-Finnish Eurpoean North-Western European',
  },
  { code: 'NFESEU', description: 'Non-Finnish Eurpoean Southern European' },
  { code: 'OTH', description: 'Other (population not assigned)' },
];

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

const GnomADTable = ({ classes, data, variantId }) => (
  <Grid container justify="space-between">
    <Grid item xs={12} sm={6} md={8}>
      <Typography variant="subtitle1">External references</Typography>
      <Typography variant="subtitle2">
        <strong>Ensembl:</strong>{' '}
        <a
          href={`http://grch37.ensembl.org/Homo_sapiens/Variation/Explore?v=${
            data.rsId
          }`}
          target="_blank"
        >
          {data.rsId}
          <Icon
            className={classNames(
              'fa',
              'fa-external-link-alt',
              classes.externalLinkIcon
            )}
          />
        </a>
      </Typography>
      <Typography variant="subtitle2">
        <strong>gnomAD:</strong>{' '}
        {variantId ? (
          <a
            href={`http://gnomad.broadinstitute.org/variant/${variantId.replace(
              /_/g,
              '-'
            )}`}
            target="_blank"
          >
            {variantId.replace(/_/g, '-')}
            <Icon
              className={classNames(
                'fa',
                'fa-external-link-alt',
                classes.externalLinkIcon
              )}
            />
          </a>
        ) : null}
      </Typography>
      <br />

      <Typography variant="subtitle1">Neighbourhood</Typography>
      <Typography variant="subtitle2">
        <strong>
          Nearest gene ({commaSeparate(data.nearestGeneDistance)} bp to
          canonical TSS):
        </strong>{' '}
        <Link to={`/gene/${data.nearestGene.id}`}>
          {data.nearestGene.symbol}
        </Link>
      </Typography>
      <Typography variant="subtitle2">
        <strong>
          Nearest coding gene ({commaSeparate(data.nearestCodingGeneDistance)}{' '}
          bp to canonical TSS):
        </strong>{' '}
        <Link to={`/gene/${data.nearestCodingGene.id}`}>
          {data.nearestCodingGene.symbol}
        </Link>
      </Typography>
      <br />

      <Typography variant="subtitle1">
        Variant Effect Predictor (
        <a
          href="https://www.ensembl.org/info/docs/tools/vep/index.html"
          target="_blank"
        >
          VEP
          <Icon
            className={classNames(
              'fa',
              'fa-external-link-alt',
              classes.externalLinkIcon
            )}
          />
        </a>
        )
      </Typography>
      <Typography variant="subtitle2">
        <strong>Most severe consequence:</strong>{' '}
        {data.mostSevereConsequence.replace(/_/g, ' ')}
      </Typography>
      <br />

      <Typography variant="subtitle1">
        Combined Annotation Dependent Depletion (
        <a href="https://cadd.gs.washington.edu/" target="_blank">
          CADD
          <Icon
            className={classNames(
              'fa',
              'fa-external-link-alt',
              classes.externalLinkIcon
            )}
          />
        </a>
        )
      </Typography>
      <Typography variant="subtitle2">
        <strong>raw: </strong>
        <span className={classes.value}>{data.caddRaw.toPrecision(3)}</span>
        <strong>scaled: </strong>
        <span className={classes.value}>{data.caddPhred.toPrecision(3)}</span>
      </Typography>
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="subtitle1">
        Population allele frequencies (
        <a href="https://gnomad.broadinstitute.org/" target="_blank">
          gnomAD
          <Icon
            className={classNames(
              'fa',
              'fa-external-link-alt',
              classes.externalLinkIcon
            )}
          />
        </a>
        )
      </Typography>
      <Grid container>
        {populations.map(p => (
          <React.Fragment key={p.code}>
            <Grid item xs={9}>
              <Typography variant="subtitle2">{p.description}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2" align="right">
                {data[`gnomad${p.code}`].toPrecision(3)}
              </Typography>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(GnomADTable);
