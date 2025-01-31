import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => {
  return {
    root: {
      display: 'block',
      margin: 'auto',
      fill: theme.palette.primary.main,
    },
  };
});

const LocusIcon = ({ className, ...rest }: SvgIconProps) => {
  const classes = useStyles();
  const iconClasses = classNames(className, classes.root);
  return (
    <SvgIcon
      className={iconClasses}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 390 587"
      {...rest}
    >
      <path
        d="M195.2 3a94 94 0 1 1-.1 188 94 94 0 0 1 .1-188zm0 163.4a69.5
      69.5 0 1 0-69.5-69.5 69.7 69.7 0 0 0 69.5 69.5zm0 81.7a61.2 61.2 0 1 1
      0 122.5 61.2 61.2 0 0 1 0-122.5zm0 98a36.9 36.9 0 0 0 26.1-62.8 36.9
      36.9 0 1 0-26.1 62.8zm0 114.4a61.2 61.2 0 1 1 0 122.5 61.2 61.2 0 0 1
      0-122.5zm0 98a36.9 36.9 0 0 0 26.1-62.8 36.9 36.9 0 1 0-26.1 62.8zM3.3
      309.3v212.4c0 6.8 5.5 12.3 12.3 12.3h89.9a12.3 12.3 0 1 0
      0-24.6H27.8V321.6h77.6a12.3 12.3 0 1 0 0-24.6H15.5c-6.7.1-12.2 5.6-12.2
      12.3zm269.5 212.4c0 6.8 5.5 12.3 12.3 12.3h52.1l-2.2 2.2a12.6 12.6 0 0
      0-3.9 8.7 12 12 0 0 0 3.6 8.9c2.4 2.3 5.6 3.6 8.9 3.6 3.3-.1 6.5-1.5
      8.7-3.9l23.1-23.1 1.6-1.9v-.5c.4-.5.6-1.1.9-1.6v-.7l.5-1.6a13 13 0 0 0
      0-4.8l-.5-1.6v-.7l-.9-1.7v-.4c-.4-.7-1-1.3-1.6-1.9l-23.1-23a12.6 12.6 0
      0 0-8.7-3.9 12 12 0 0 0-8.9 3.6 12.9 12.9 0 0 0-3.6 8.9c.1 3.3 1.5 6.5
      3.9 8.7l2.2 2.2h-52.1a12.3 12.3 0 0 0-12.3 12.2zm0-212.4c0 6.8 5.5 12.3
      12.3 12.3H375c6.8 0 12.3-5.5
      12.3-12.3V96.9c0-6.8-5.5-12.3-12.3-12.3h-49a12.3 12.3 0 1 0 0
      24.6h36.8v187.9h-77.6c-6.9 0-12.4 5.5-12.4 12.2z"
      />
    </SvgIcon>
  );
};

export default LocusIcon;
