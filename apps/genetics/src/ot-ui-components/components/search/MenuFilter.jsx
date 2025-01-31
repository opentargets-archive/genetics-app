import React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  paper: {
    marginTop: theme.spacing.unit,
    position: 'absolute',
    minWidth: '100px',
    maxWidth: '800px',
    zIndex: 1005,
  },
});

const Menu = ({ classes, innerProps, children }) => (
  <Paper square className={classes.paper} {...innerProps}>
    {children}
  </Paper>
);

export default withStyles(styles)(Menu);
