import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  page: {
    background: theme.palette.grey['50'],
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    width: '100%',
  },
  gridContainer: {
    margin: 0,
    padding: '24px',
    width: '100%',
    flex: '1 0 auto',
  },
}));

function Page({
  header,
  footer,
  children,
}: {
  header: React.ReactNode,
  footer: React.ReactNode,
  children: React.ReactNode,
}) {
  const classes = useStyles();
  return (
    <div className={classes.page}>
      {header}
      <Grid
        container
        justifyContent={'center'}
        spacing={4}
        className={classes.gridContainer}
      >
        <Grid item xs={12} md={11}>
          {children}
        </Grid>
      </Grid>
      {footer}
    </div>
  );
}

Page.propTypes = {
  /** The header component */
  header: PropTypes.node,
  /** The footer component */
  footer: PropTypes.node,
  /** The children (page content) */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

Page.defaultProps = {
  header: null,
  footer: null,
  children: null,
};

export { Page };

export default Page;
