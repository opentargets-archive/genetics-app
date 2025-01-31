import React from 'react';
import { ButtonProps, default as MuiButton } from '@material-ui/core/Button';

const Button = ({ children, color, variant, ...rest }: ButtonProps) => (
  <MuiButton
    color={color ? color : 'primary'}
    variant={variant ? variant : 'contained'}
    {...rest}
  >
    {children}
  </MuiButton>
);

export default Button;
