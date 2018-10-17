import React from 'react';
import DownArrowIcon from '@material-ui/icons/KeyboardArrowDown';
import withStyles from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';

const styles = theme => {
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
};

const ScrollDownButton = ({ classes, className, onClick }) => {
  const iconClasses = classNames(classes.root, className);
  return (
    <div className={iconClasses} onClick={onClick}>
      <DownArrowIcon className={classes.icon} />
    </div>
  );
};

export default withStyles(styles)(ScrollDownButton);
