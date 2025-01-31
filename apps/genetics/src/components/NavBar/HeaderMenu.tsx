import React, { useState } from 'react';
import {
  MenuItem,
  Popper,
  MenuList,
  IconButton,
  Fade,
  Paper,
  ClickAwayListener,
  makeStyles,
  PopperProps,
} from '@material-ui/core';
import { Menu as MenuIcon, Close as CloseIcon } from '@material-ui/icons';
import Link from '../Link';

const useStyles = makeStyles({
  icon: {
    marginLeft: '20px',
  },
  menuLink: {
    width: '100%',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '16px',
    paddingRight: '16px',
  },
  menuItem: {
    paddingLeft: '0px',
    paddingRight: '0px',
  },
});

function HeaderMenu({
  items,
  placement,
}: {
  items: { url: string; external: boolean; name: string }[];
  placement?: PopperProps['placement'];
}) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  return (
    <>
      <IconButton
        className={classes.icon}
        size="medium"
        color="inherit"
        aria-label="open header menu"
        aria-haspopup="true"
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>

      <Popper
        open={isMenuOpen}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
        placement={placement || 'bottom-start'}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                <MenuList
                  onKeyDown={event => {
                    if (event.key === 'Tab') {
                      event.preventDefault();
                      setAnchorEl(null);
                    }
                  }}
                >
                  {items.map((item, i) => (
                    <MenuItem
                      onClick={() => setAnchorEl(null)}
                      key={i}
                      dense={true}
                      className={classes.menuItem}
                    >
                      <Link
                        external={item.external}
                        to={item.url}
                        className={classes.menuLink}
                      >
                        {item.name}
                      </Link>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
}

export default HeaderMenu;
