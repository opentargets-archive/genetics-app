import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  heading: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  subheading: {
    color: theme.palette.grey[800],
    fontSize: '0.75rem',
  },
  extra: {
    color: theme.palette.grey[600],
    fontSize: '0.65rem',
  },
  proportionContainer: {
    width: '100%',
  },
  proportion: {
    height: '2px',
    float: 'left',
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
  },
  proportionRemainder: {
    height: '2px',
    borderBottom: `2px solid ${theme.palette.grey[100]}`,
    width: '100%',
  },
  count: {
    float: 'right',
  },
}));

type BaseSearchOptionProps = {
  heading: string;
  subheading: string;
  extra?: string | JSX.Element;
  count?: number;
  proportion?: number;
};
const SearchOption = ({
  heading,
  subheading,
  extra,
  count,
  proportion,
}: BaseSearchOptionProps) => {
  const classes = useStyles();
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="body1">
          <span className={classes.heading}>{heading}</span>
          {'  '}
          <span className={classes.subheading}>{subheading}</span>
          {count ? <span className={classes.count}>{count}</span> : null}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" className={classes.extra}>
          {extra}
        </Typography>
        {proportion ? (
          <div className={classes.proportionContainer}>
            <div
              className={classes.proportion}
              style={{ width: `${proportion * 100}%` }}
            />
            <div className={classes.proportionRemainder} />
          </div>
        ) : null}
      </Grid>
    </Grid>
  );
};

export default SearchOption;
