import React from 'react';
import { withStyles } from '@material-ui/core';

import { Link, Button } from 'ot-ui';

const styles = {
  button: {
    lineHeight: 1,
    minWidth: '110px',
  },
  buttonBig: {
    fontSize: '1.1rem',
    minWidth: '150px',
    width: '150px',
    height: '40px',
    paddingLeft: '15px',
  },
  icon: {
    fill: 'white',
    width: '20px',
    height: '20px',
    marginTop: '-5px',
    marginBottom: '-5px',
    marginLeft: '5px',
  },
  iconBig: {
    fill: 'white',
    width: '30px',
    height: '30px',
  },
  link: {
    textDecoration: 'none',
  },
};

const StudyLocusLink = ({ big, studyId, indexVariantId, classes }) => {
  return (
    <Link
      to={`/study-locus/${studyId}/${indexVariantId}`}
      className={classes.link}
    >
      <Button gradient className={big ? classes.buttonBig : classes.button}>
        Colocalisation
      </Button>
    </Link>
  );
};

export default withStyles(styles)(StudyLocusLink);
