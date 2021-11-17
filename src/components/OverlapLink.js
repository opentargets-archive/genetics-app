import React from 'react';
import { withStyles } from '@material-ui/core';

import { Link, Button, OverlapIcon } from '../ot-ui-components';

const styles = {
  button: {
    lineHeight: 1,
    minWidth: '110px',
  },
  buttonBig: {
    fontSize: '1.1rem',
    minWidth: '200px',
    width: '200px',
    height: '40px',
    paddingLeft: '15px',
  },
  icon: {
    stroke: 'white',
    width: '20px',
    height: '20px',
    marginTop: '-5px',
    marginBottom: '-5px',
    marginLeft: '5px',
  },
  iconBig: {
    stroke: 'white',
    width: '30px',
    height: '30px',
  },
  link: {
    textDecoration: 'none',
  },
};

const OverlapLink = ({ big, studyId, classes }) => {
  return (
    <Link to={`/study-comparison/${studyId}`} className={classes.link}>
      <Button className={big ? classes.buttonBig : classes.button}>
        Compare Studies
        <OverlapIcon className={big ? classes.iconBig : classes.icon} />
      </Button>
    </Link>
  );
};

export default withStyles(styles)(OverlapLink);
