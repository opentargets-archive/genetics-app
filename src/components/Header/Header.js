import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const useStyles = makeStyles(theme => ({
  externalLinks: {
    '& > :not(:first-child):before': {
      content: '" | "',
    },
  },
  mainIconContainer: {
    width: '56px',
    textAlign: 'center',
    marginRight: '15px',
  },
  mainIcon: {
    height: '65px',
    color: theme.palette.primary.main,
  },
  subtitle: {
    display: 'flex',
    paddingLeft: '5px',
    alignItems: 'center',
  },
  title: {
    fontWeight: 500,
    marginRight: '10px',
  },
  titleContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
}));

function Header({
  loading,
  Icon,
  title,
  subtitle = null,
  externalLinks,
  children = null,
}) {
  const classes = useStyles();

  return (
    <Grid
      className={classes.titleContainer}
      container
      id="profile-page-header-block"
    >
      <Grid item zeroMinWidth>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className={classes.mainIconContainer}>
            <FontAwesomeIcon
              icon={Icon}
              size="4x"
              className={classes.mainIcon}
            />
          </Grid>
          <Grid item zeroMinWidth>
            <Grid container alignItems="baseline">
              <Typography
                className={classes.title}
                color="textSecondary"
                variant="h5"
                noWrap
                title={title}
              >
                {loading ? <Skeleton width="10vw" /> : title}
              </Typography>
              <Typography className={classes.subtitle} variant="body2">
                {loading ? <Skeleton width="25vw" /> : subtitle}
              </Typography>
            </Grid>
            <Grid container>
              <Typography variant="body2" className={classes.externalLinks}>
                {loading ? <Skeleton width="50vw" /> : externalLinks}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>{children}</Grid>
    </Grid>
  );
}

export default Header;
