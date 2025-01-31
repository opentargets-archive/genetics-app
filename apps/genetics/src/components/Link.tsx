import { MouseEventHandler, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  base: {
    fontFamily: 'Inter',
    fontSize: 'inherit',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  baseDefault: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
  baseTooltip: {
    color: 'white',
    '&:hover': {
      color: theme.palette.primary.light,
    },
    textDecoration: 'underline',
  },
  baseFooter: {
    color: 'white',
    '&:hover': {
      color: theme.palette.primary.light,
    },
    display: 'flex',
    alignItems: 'center',
  },
  externalIcon: {
    fontSize: '70%',
    verticalAlign: 'baseline',
    marginLeft: '3px',
    width: 'auto',
    height: 'auto',
    display: 'inline',
  },
}));

type LinkProps = {
  children: ReactNode;
  /** Whether the link directs to an external site. */
  external?: boolean;
  /** Whether the link is used within the footer section. */
  footer?: boolean;
  /** Whether the link is used within a tooltip. */
  tooltip?: boolean;
  /** The handler to call on click. */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** The url to visit on clicking the link. */
  to: string;
  className?: string;
};

function Link({
  children,
  to,
  onClick,
  external = false,
  footer = false,
  tooltip = false,
  className,
}: LinkProps) {
  const classes = useStyles();
  return external ? (
    <a
      className={classNames(
        classes.base,
        {
          [classes.baseDefault]: !footer && !tooltip,
          [classes.baseFooter]: footer,
          [classes.baseTooltip]: tooltip,
        },
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={to}
      onClick={onClick}
    >
      {children}
    </a>
  ) : (
    <RouterLink
      className={classNames(
        classes.base,
        {
          [classes.baseDefault]: !footer && !tooltip,
          [classes.baseFooter]: footer,
          [classes.baseTooltip]: tooltip,
        },
        className
      )}
      to={to}
      onClick={onClick}
    >
      {children}
    </RouterLink>
  );
}

export { Link };

export default Link;
