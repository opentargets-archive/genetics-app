import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Search from '../../components/Search';

const styles = theme => ({
  icon: {
    color: theme.palette.primary.main,
    marginBottom: '12px',
  },
  actionText: {
    width: '150px',
  },
  suggestions: {
    width: '450px',
    marginBottom: '42px',
  },
  message: {
    marginBottom: '24px',
  },
});

const EmptyPage = ({ classes, children }) => {
  return (
    <Grid container direction="column" alignItems="center">
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        size="3x"
        className={classes.icon}
      />
      <Typography variant="h5">Sorry</Typography>
      <div className={classes.message}>{children}</div>
      <Search />
    </Grid>
  );
};

export default withStyles(styles)(EmptyPage);
