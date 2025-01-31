import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const useStyles = makeStyles(() => ({
  root: {
    display: 'inline',
  },
  fat: {
    fontWeight: 1100,
    textTransform: 'capitalize',
  },
  thin: {
    fontWeight: 300,
    textTransform: 'capitalize',
  },
}));

const OpenTargetsTitle = ({
  className,
  name,
}: {
  className: string;
  name: string;
}) => {
  const classes = useStyles();
  const titleClasses = classNames(classes.root, className);
  return (
    <Typography className={titleClasses} variant="h6" color="inherit">
      <span className={classes.fat}>Open Targets </span>
      <span className={classes.thin}>{name}</span>
    </Typography>
  );
};

export default OpenTargetsTitle;
