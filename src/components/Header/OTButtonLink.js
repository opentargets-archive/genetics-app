import React from 'react';
import { makeStyles } from '@material-ui/core';

import { Button } from '../../ot-ui-components';

const useStyles = makeStyles(() => ({
  button: {
    lineHeight: 1,
    minWidth: '110px',
    marginLeft: '2px',
  },
  link: {
    textDecoration: 'none',
  },
}));

const OTButtonLink = ({ id, symbol }) => {
  const classes = useStyles();
  const btnLabel = `View ${symbol} in the Open Targets Platform`;
  return (
    <a
      href={`https://platform.opentargets.org/target/${id}`}
      className={classes.link}
    >
      <Button className={classes.button}>{btnLabel}</Button>
    </a>
  );
};

export default OTButtonLink;
