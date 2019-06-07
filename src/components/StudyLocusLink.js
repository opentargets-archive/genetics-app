import React from 'react';
import { withStyles } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';

import { Link, Button } from 'ot-ui';

const styles = {
  button: {
    lineHeight: 1,
    minWidth: '110px',
    marginLeft: '2px',
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
  container: {
    display: 'inline-block',
  },
};

const StudyLocusLink = ({
  big,
  studyId,
  indexVariantId,
  classes,
  hasSumsStats,
}) => {
  return (
    <Tooltip
      title={
        hasSumsStats
          ? 'View colocalisation results at this locus'
          : 'Colocalisation results are only available for studies that have summary statistics available'
      }
      placement="top"
    >
      {hasSumsStats ? (
        <div className={classes.container}>
          <Link
            to={`/study-locus/${studyId}/${indexVariantId}`}
            className={classes.link}
          >
            <Button className={big ? classes.buttonBig : classes.button}>
              Colocalisation
            </Button>
          </Link>
        </div>
      ) : (
        <div className={classes.container}>
          <Button disabled className={big ? classes.buttonBig : classes.button}>
            Colocalisation
          </Button>
        </div>
      )}
    </Tooltip>
  );
};

export default withStyles(styles)(StudyLocusLink);
