import React from 'react';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { withStyles } from '@material-ui/core';

import { Button, OverlapIcon } from 'ot-ui';

const mb = 1000000;

const styles = {
  button: {
    lineHeight: 1,
  },
  buttonBig: {
    fontSize: '1.1rem',
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
      <Button gradient className={big ? classes.buttonBig : classes.button}>
        Compare Studies
        <OverlapIcon className={big ? classes.iconBig : classes.icon} />
      </Button>
    </Link>
  );
};

export default withStyles(styles)(OverlapLink);
