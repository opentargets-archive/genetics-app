import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MuiSlider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';

const styles = {
  root: {
    width: 200,
    padding: '0 20px',
  },
  sliderContainer: {
    padding: '10px 5px 8px 5px',
  },
  min: {
    fontSize: '0.7rem',
  },
  max: {
    fontSize: '0.7rem',
  },
};

const Slider = ({ classes, label, value, min, max, step, onChange }) => {
  return (
    <div className={classes.root}>
      <Typography>{label}</Typography>
      <div className={classes.sliderContainer}>
        <MuiSlider
          classes={{ container: classes.slider }}
          {...{ value, min, max, step, onChange }}
        />
      </div>

      <Grid container justifyContent="space-between">
        <Grid item>
          <Typography className={classes.min}>{min}</Typography>
        </Grid>
        <Grid item>
          <Typography className={classes.max}>{max}</Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(Slider);
