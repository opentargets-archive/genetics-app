import React from 'react';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Add from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  selectContainer: {
    paddingLeft: '4px',
    paddingRight: '4px',
  },
});

const BrowserControls = ({
  classes,
  handlePanLeft,
  handlePanRight,
  handleZoomIn,
  handleZoomOut,
  displayTypeValue,
  displayTypeOptions,
  displayFinemappingValue,
  displayFinemappingOptions,
  handleDisplayTypeChange,
  handleDisplayFinemappingChange,
  disabledZoomOut = false,
}) => (
  <Grid container alignItems="center">
    <Grid item>
      <IconButton onClick={handlePanLeft}>
        <KeyboardArrowLeft />
      </IconButton>
    </Grid>
    <Grid item>
      <IconButton onClick={handlePanRight}>
        <KeyboardArrowRight />
      </IconButton>
    </Grid>
    <Grid item>
      <IconButton onClick={handleZoomIn}>
        <Add />
      </IconButton>
    </Grid>
    <Grid item>
      <IconButton onClick={handleZoomOut} disabled={disabledZoomOut}>
        <Remove />
      </IconButton>
    </Grid>
    <Grid item>
      <div className={classes.selectContainer}>
        <Select value={displayTypeValue} onChange={handleDisplayTypeChange}>
          {displayTypeOptions.map(d => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </Select>
      </div>
    </Grid>
    <Grid item>
      <div className={classes.selectContainer}>
        <Select
          value={displayFinemappingValue}
          onChange={handleDisplayFinemappingChange}
        >
          {displayFinemappingOptions.map(d => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </Select>
      </div>
    </Grid>
  </Grid>
);

export default withStyles(styles)(BrowserControls);
