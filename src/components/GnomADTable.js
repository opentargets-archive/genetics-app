import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { Link, Typography, commaSeparate } from 'ot-ui';

const populations = [
  { code: 'AFR', description: 'African/African-American' },
  { code: 'AMR', description: 'Latino/Admixed American' },
  { code: 'ASJ', description: 'Ashkenazi Jewish' },
  { code: 'EAS', description: 'East Asian' },
  { code: 'FIN', description: 'Finnish' },
  { code: 'NFE', description: 'Non-Finnish European' },
  { code: 'NFEEST', description: 'Non-Finnish European Estonian' },
  {
    code: 'NFENWE',
    description: 'Non-Finnish European North-Western European',
  },
  { code: 'NFESEU', description: 'Non-Finnish European Southern European' },
  { code: 'OTH', description: 'Other (population not assigned)' },
];

const styles = () => ({
  value: {
    paddingLeft: '0.6rem',
    paddingRight: '1rem',
  },
});

const GnomADTable = ({ classes, data, variantId }) => {
  const gnomadId = variantId.replaceAll('_', '-');
  return (
    <Grid container justify="space-between">
      <Grid item xs={12} sm={6} md={8}>
        <Typography variant="subtitle1">Location</Typography>
        <Typography variant="subtitle2">
          <strong>GRCh38:</strong> {data.chromosome}:
          {commaSeparate(data.position)}
        </Typography>
        <Typography variant="subtitle2">
          <strong>GRCh37:</strong> {data.chromosomeB37}:
          {commaSeparate(data.positionB37)}
        </Typography>
        <Typography variant="subtitle2">
          <strong>Reference allele:</strong> {data.refAllele}
        </Typography>
        <Typography variant="subtitle2">
          <strong>Alternative allele (effect allele):</strong> {data.altAllele}
        </Typography>

        <br />

        <Typography variant="subtitle1">External references</Typography>
        <Typography variant="subtitle2">
          <strong>Ensembl:</strong>{' '}
          <Link
            external
            to={`http://www.ensembl.org/Homo_sapiens/Variation/Explore?v=${
              data.rsId
            }`}
          >
            {data.rsId}
          </Link>
        </Typography>
        <br />

        <Typography variant="subtitle1">Neighbourhood</Typography>
        {data.nearestGene ? (
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
        {data.nearestCodingGene ? (
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
          <strong>Most severe consequence:</strong>{' '}
          {data.mostSevereConsequence
            ? data.mostSevereConsequence.replace(/_/g, ' ')
            : 'N/A'}
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
            {data.caddRaw ? data.caddRaw.toPrecision(3) : 'N/A'}
          </span>
          <strong>scaled: </strong>
          <span className={classes.value}>
            {data.caddPhred ? data.caddPhred.toPrecision(3) : 'N/A'}
          </span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="subtitle1">
          Population allele frequencies (
          <Link
            external
            to={`https://gnomad.broadinstitute.org/variant/${gnomadId}?dataset=gnomad_r3`}
          >
            gnomAD
          </Link>
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
  );
};

export default withStyles(styles)(GnomADTable);
