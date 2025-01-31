import React from 'react';
import DownArrowIcon from '@material-ui/icons/KeyboardArrowDown';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => {
  return {
    root: {
      cursor: 'pointer',
      display: 'flex',
      backgroundColor: 'white',
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      border: '2px solid black',
    },
    icon: {
      margin: 'auto',
      fill: theme.palette.primary.main,
    },
  };
});

const ScrollDownButton = ({ className, onClick }) => {
  const classes = useStyles();
  const iconClasses = classNames(classes.root, className);
  return (
    <div className={iconClasses} onClick={onClick}>
      <DownArrowIcon className={classes.icon} />
    </div>
  );
};

export default ScrollDownButton;
