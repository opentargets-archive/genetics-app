import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles, MenuItem, MenuList, PopperProps } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import classNames from 'classnames';
import Link from '../Link';
import OpenTargetsTitle from './OpenTargetsTitle';
import HeaderMenu from './HeaderMenu';

const useStyles = makeStyles(theme => ({
  navbar: {
    backgroundColor: theme.palette.primary.main,
    margin: 0,
    width: '100%',
  },
  navbarHomepage: {
    left: 0,
    top: 0,
    position: 'absolute',
  },
  flex: {
    flexGrow: 1,
  },
  menuExternalLinkContainer: {
    fontSize: '1rem',
    '&:first-of-type': {
      marginLeft: '1rem',
    },
    '&:not(:last-child)': {
      marginRight: '1rem',
    },
  },
  menuExternalLink: {
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.secondary.main,
    },
  },
  menuList: {
    display: 'flex',
  },
  menuItem: {
    paddingTop: '6px',
    paddingBottom: '6px',
  },
  menuLink: {
    fontSize: '0.875rem',
    color: '#fff',
    '&:hover': {
      color: '#fff',
    },
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  navLogo: {
    flex: 1,
  },
  navSearch: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  navMenu: {
    flex: 1,
    display: 'flex',
    justifyContent: 'end',
  },
}));

const MenuExternalLink = ({ href, children }) => {
  const classes = useStyles();
  return (
    <Typography color="inherit" className={classes.menuExternalLinkContainer}>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        className={classes.menuExternalLink}
      >
        {children}
      </a>
    </Typography>
  );
};
const NavBar = ({
  name,
  search,
  api,
  downloads,
  docs,
  contact,
  homepage,
  items,
  placement,
}: {
  name: string;
  search: React.ReactNode;
  api?: string;
  docs?: string;
  downloads?: string;
  contact?: string;
  items: { external: boolean; name: string; url: string }[];
  homepage: boolean;
  placement?: PopperProps['placement'];
}) => {
  const classes = useStyles();
  const smMQ = useMediaQuery('(max-width:800px)');
  const isHomePageRegular = homepage && !smMQ;
  return (
    <AppBar
      className={classNames(classes.navbar, {
        [classes.navbarHomepage]: homepage,
      })}
      position="static"
      color="primary"
      elevation={0}
    >
      <Toolbar variant="dense" className={classes.spaceBetween}>
        <div className={classes.navLogo}>
          {homepage ? null : (
            <Button component={ReactRouterLink} to="/" color="inherit">
              <OpenTargetsTitle name={name} />
            </Button>
          )}
        </div>
        <div className={classes.navSearch}>{search ? search : null}</div>
        <div className={classes.navMenu}>
          {docs ? <MenuExternalLink href={docs}>Docs</MenuExternalLink> : null}

          {api ? <MenuExternalLink href={api}>API</MenuExternalLink> : null}

          {downloads ? (
            <MenuExternalLink href={downloads}>Downloads</MenuExternalLink>
          ) : null}

          {contact ? (
            <MenuExternalLink href={contact}>Contact</MenuExternalLink>
          ) : null}

          {items && !isHomePageRegular ? (
            <HeaderMenu items={items} placement={placement} />
          ) : null}

          {isHomePageRegular && (
            <MenuList className={classes.menuList}>
              {items.map((item, i) => (
                <MenuItem key={i} dense={true} className={classes.menuItem}>
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
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
