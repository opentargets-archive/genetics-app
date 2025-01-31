import { Typography, makeStyles } from '@material-ui/core';
import { ReactNode } from 'react';

const useStyles = makeStyles(theme => ({
  groupHeading: {
    paddingBottom: '.25rem',
  },
  groupHeadingText: {
    padding: '0 .25rem',
    fontSize: '.75rem',
    color: theme.palette.secondary.main,
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
  },
}));

const groupName: { [key: string]: string } = {
  variant: 'Variants',
  gene: 'Genes',
  study: 'Studies',
};

type GroupProps = {
  children: ReactNode;
  name: string;
};
function Group({ children, name }: GroupProps) {
  const classes = useStyles();

  return (
    <div className={classes.groupHeading}>
      {name !== 'any' && (
        <Typography className={classes.groupHeadingText} variant="body1">
          {groupName[name]}
        </Typography>
      )}
      {children}
    </div>
  );
}

export default Group;
