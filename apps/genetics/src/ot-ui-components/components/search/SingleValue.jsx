import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  singleValue: {
    fontSize: 16,
  },
};

const SingleValue = ({ classes, innerProps, children }) => {
  return (
    <Typography className={classes.singleValue} {...innerProps}>
      {children}
    </Typography>
  );
};

export default withStyles(styles)(SingleValue);
