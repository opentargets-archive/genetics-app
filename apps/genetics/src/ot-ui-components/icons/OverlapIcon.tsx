import React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const useStyles = makeStyles(theme => {
  return {
    root: {
      display: 'block',
      margin: 'auto',
      strokeWidth: 30,
      stroke: theme.palette.primary.main,
      fill: 'none',
    },
  };
});

const OverlapIcon = ({ className, ...rest }: SvgIconProps) => {
  const classes = useStyles();
  const iconClasses = classNames(className, classes.root);
  return (
    <SvgIcon
      className={iconClasses}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 390 587"
      {...rest}
    >
      <circle cx={100} cy={293.5} r={150} />
      <circle cx={290} cy={293.5} r={150} />
    </SvgIcon>
  );
};

export default OverlapIcon;
