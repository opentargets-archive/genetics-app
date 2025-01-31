import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  high: {
    color: theme.palette.high,
  },
  medium: {
    color: theme.palette.medium,
  },
  low: {
    color: theme.palette.low,
  },
  default: {
    color: theme.palette.grey[500],
  },
});

const LabelHML = ({ level, children, classes }) => {
  const labelClass =
    level === 'L'
      ? classes.low
      : level === 'M'
        ? classes.medium
        : level === 'H'
          ? classes.high
          : classes.default;
  return <span className={labelClass}>{children}</span>;
};

export default withStyles(styles)(LabelHML);
