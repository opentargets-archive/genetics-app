import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import ModelSchematic from './ModelSchematic';

const styles = theme => ({
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  hr: {
    marginTop: '1rem',
  },
  flex: {
    flexGrow: 1,
  },
  heading: {
    fontWeight: 400,
  },
});

const SectionHeading = ({ classes, heading, subheading, entities }) => {
  return (
    <React.Fragment>
      <hr className={classes.hr} />
      <div className={classes.container}>
        <div>
          <Typography className={classes.heading} variant="h6">
            {heading}
          </Typography>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle1">{subheading}</Typography>
            </Grid>
          </Grid>
        </div>
        <div className={classes.flex} />
        {entities ? <ModelSchematic entities={entities} /> : null}
      </div>
    </React.Fragment>
  );
};

export default withStyles(styles)(SectionHeading);
