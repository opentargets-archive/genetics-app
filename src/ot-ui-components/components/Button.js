import React from 'react';
import { default as MuiButton } from '@material-ui/core/Button';

const Button = ({ children, color, variant, ...rest }) => (
  <MuiButton
    color={color ? color : 'primary'}
    variant={variant ? variant : 'contained'}
    {...rest}
  >
    {children}
  </MuiButton>
);

export default Button;
