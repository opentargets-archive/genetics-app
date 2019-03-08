import React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import Icon from '@material-ui/core/Icon';
import HelpIcon from '@material-ui/icons/Help';

import { Typography, PlotContainer, PlotContainerSection } from 'ot-ui';
import { CardContent } from '@material-ui/core';

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

const GnomADTable = ({ classes, data }) => (
  <Card>
    <CardContent className={classes.cardContent}>
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
        <span className={classes.value}>{data.caddRaw}</span>
        <strong>scaled: </strong>
        <span className={classes.value}>{data.caddPhred}</span>
      </Typography>
      <br />
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
      <Typography variant="subtitle2">
        {populations.map(p => (
          <React.Fragment key={p.code}>
            <Badge
              badgeContent={
                <Tooltip title={p.description} placement="top">
                  <HelpIcon className={classes.tooltipIcon} />
                </Tooltip>
              }
            >
              <strong>{p.code}: </strong>
            </Badge>
            <span className={classes.valueWithBadgedLabel}>
              {data[`gnomad${p.code}`].toPrecision(3)}
            </span>
          </React.Fragment>
        ))}
      </Typography>
    </CardContent>
  </Card>
);

export default withStyles(styles)(GnomADTable);
