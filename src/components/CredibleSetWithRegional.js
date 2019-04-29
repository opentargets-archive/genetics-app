import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { CredibleSet, Regional } from 'ot-charts';

const styles = () => ({
  container: {
    width: '100%',
    maxWidth: '100%',
  },
});

const CredibleSetWithRegional = ({
  classes,
  credibleSetProps,
  regionalProps,
}) => (
  <ExpansionPanel>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      <div className={classes.container}>
        <CredibleSet {...credibleSetProps} />
      </div>
    </ExpansionPanelSummary>
    <ExpansionPanelDetails>
      <div className={classes.container}>
        <Regional {...regionalProps} />
      </div>
    </ExpansionPanelDetails>
  </ExpansionPanel>
);

export default withStyles(styles)(CredibleSetWithRegional);
