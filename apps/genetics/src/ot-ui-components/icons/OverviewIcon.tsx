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

const OverviewIcon = ({ className, ...rest }: SvgIconProps) => {
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
        d="M26,32c0-6.1,5-11.1,11.1-11.1h244.7c6.1,0,11.1,4.9,11.1,11.1v211.4c0,6.1-5,11.1-11.1,11.1H37.1
					c-6.1,0-11.1-4.9-11.1-11.1V32z M37.1,32v211.4h244.8V32H37.1z"
      />
      <rect x="59.4" y="54.2" width="33.4" height="11.1" />
      <rect x="103.9" y="54.2" width="55.6" height="11.1" />
      <rect x="59.4" y="76.5" width="33.4" height="11.1" />
      <rect x="103.9" y="76.5" width="55.6" height="11.1" />
      <rect x="59.4" y="98.8" width="33.4" height="11.1" />
      <rect x="103.9" y="98.8" width="55.6" height="11.1" />
      <rect x="59.4" y="121" width="33.4" height="11.1" />
      <rect x="192.9" y="165.5" width="22.2" height="11.1" />
      <rect x="192.9" y="187.8" width="22.2" height="11.1" />
      <rect x="192.9" y="210" width="22.2" height="11.1" />
      <rect x="226.2" y="165.5" width="33.4" height="11.1" />
      <path
        d="M205.9,129.2c-14.2-5.8-24.2-19.8-24.2-36c0-11.5,5-21.9,12.9-29l20,30L205.9,129.2z M216.7,131.9
					c1.3,0.1,2.6,0.2,4,0.2c21.5,0,38.9-17.4,38.9-38.9c0-1.3-0.1-2.7-0.2-4l-34.2,8.5L216.7,131.9z M203.9,58
					c5.1-2.4,10.8-3.8,16.8-3.8c16.3,0,30.2,10,36,24.2l-33.6,8.4L203.9,58z"
      />
      <path
        d="M26,32c0-6.1,5-11.1,11.1-11.1h244.7c6.1,0,11.1,4.9,11.1,11.1v211.4c0,6.1-5,11.1-11.1,11.1H37.1
					c-6.1,0-11.1-4.9-11.1-11.1V32z M37.1,32v211.4h244.8V32H37.1z"
      />
      <rect x="226.2" y="187.8" width="33.4" height="11.1" />
      <rect x="226.2" y="210" width="33.4" height="11.1" />
      <rect x="59.4" y="154.4" width="11.1" height="66.8" />
      <rect x="81.6" y="198.9" width="11.1" height="22.2" />
      <rect x="103.9" y="176.6" width="11.1" height="44.5" />
      <rect x="126.1" y="176.6" width="11.1" height="44.5" />
      <rect x="148.4" y="187.8" width="11.1" height="33.4" />
      <rect x="103.9" y="121" width="55.6" height="11.1" />
    </SvgIcon>
  );
};

export default OverviewIcon;
