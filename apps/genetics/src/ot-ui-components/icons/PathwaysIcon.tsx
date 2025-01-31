import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const useStyles = makeStyles(theme => {
  return {
    root: {
      display: 'block',
      margin: 'auto',
      width: '100px',
      height: '100px',
      fill: theme.palette.primary.main,
    },
  };
});

const PathwaysIcon = ({ className, ...rest }: SvgIconProps) => {
  const classes = useStyles();
  const iconClasses = classNames(className, classes.root);
  return (
    <SvgIcon
      className={iconClasses}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 279"
      {...rest}
    >
      <path
        d="M286.1,112.5l-40.6-40.6c-2.7-2.6-6.9-2.6-9.5,0.1c-2.6,2.6-2.7,6.9-0.1,9.5l29.1,29.1h-24.3c-35.3,0-60.3,11.6-74.5,33.7
		V25.4l29.1,29.1c2.7,2.6,6.9,2.6,9.5-0.1c2.6-2.6,2.7-6.9,0.1-9.5L164.2,4.2c-2.6-2.7-6.9-2.7-9.6,0l-40.6,40.6
		c-2.6,2.7-2.6,6.9,0.1,9.5c2.6,2.6,6.9,2.7,9.5,0.1l29.1-29.1v118.9c-14.1-22.2-39.1-33.7-74.5-33.7H54L83,81.5
		c2.6-2.7,2.6-6.9-0.1-9.5c-2.6-2.6-6.9-2.7-9.5-0.1l-40.6,40.6c-2.6,2.6-2.6,6.9,0,9.6l40.6,40.6c1.3,1.3,3,2,4.8,2
		c1.8,0,3.6-0.7,4.8-2c1.3-1.3,2-3,2-4.8c0-1.8-0.7-3.5-2-4.8L54,124.1h24.3c50.1,0,74.5,24.4,74.5,74.5v67.7c0,3.7,3,6.8,6.8,6.8
		c3.7,0,6.8-3,6.8-6.8v-67.7c0-50.1,24.4-74.5,74.5-74.5H265l-29.1,29.1c-1.3,1.3-2,3-2,4.8c0,1.8,0.7,3.6,2,4.8c1.3,1.3,3,2,4.8,2
		c1.8,0,3.5-0.7,4.8-2l40.6-40.6C288.7,119.5,288.7,115.2,286.1,112.5L286.1,112.5z"
      />
    </SvgIcon>
  );
};

export default PathwaysIcon;
