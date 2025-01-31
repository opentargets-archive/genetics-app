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

const MouseIcon = ({ className, ...rest }: SvgIconProps) => {
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
        d="M279,136.3c-24.7-18.6-34.7-30.7-35.4-33.9c-0.6-22.3-14.8-36.4-36.9-36.9c-7.1-0.1-14.4,1.8-20.3,5.5
			c-17.2-13-40.2-24-82-24c-51,0-74.3,38.5-74.3,74.3c0,17.9,6.3,40.9,21.4,56.5c-12.3,2.9-21.4,13.9-21.4,27
			c0,15.4,12.5,27.9,27.9,27.9h185.7c5.1,0,9.3-4.2,9.3-9.3s-4.2-9.3-9.3-9.3H57.9c-5.1,0-9.3-4.2-9.3-9.3c0-5.1,4.2-9.3,9.3-9.3
			h204.2c15.4,0,27.9-12.5,27.9-27.9v-9.2C290,149.7,285.9,141.5,279,136.3L279,136.3z M271.4,167.6c0,5.1-4.2,9.3-9.3,9.3H95
			c-45.9,0-46.4-55.1-46.4-55.7c0-20.7,11.7-55.7,55.7-55.7c34,0,52.9,7.2,69.3,19.2c-0.2,0.4-0.4,0.7-0.5,1.1
			c-7.2,15.6-4.1,31.1,8.6,42.4c3.8,3.4,9.7,3.1,13.1-0.7c3.4-3.8,3.1-9.7-0.7-13.1c-6.6-5.9-7.9-12.5-4.1-20.8
			c2.7-5.8,8.9-9.5,15.9-9.5h0.4c4.5,0.1,18.2,0.4,18.7,18.8c0.1,4.4,0.4,16.2,42.8,48.2c2.2,1.7,3.6,4.4,3.6,7.3L271.4,167.6z"
      />
      <path d="M225,139.7c0,5.1-4.2,9.3-9.3,9.3s-9.3-4.2-9.3-9.3s4.2-9.3,9.3-9.3S225,134.6,225,139.7z" />
    </SvgIcon>
  );
};

export default MouseIcon;
