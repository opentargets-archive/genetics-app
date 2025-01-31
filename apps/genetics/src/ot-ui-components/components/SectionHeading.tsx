import { ReactNode } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ModelSchematic, { ModelSchematicEntity } from './ModelSchematic';

const useStyles = makeStyles({
  container: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  hr: {
    marginTop: '1rem',
  },
  flex: {
    flexGrow: 1,
  },
  heading: {
    fontWeight: 400,
  },
});

type SectionHeadingProps = {
  heading: ReactNode;
  subheading: ReactNode;
  entities: ModelSchematicEntity[];
};
const SectionHeading = ({
  heading,
  subheading,
  entities,
}: SectionHeadingProps) => {
  const classes = useStyles();
  return (
    <>
      <hr className={classes.hr} />
      <div className={classes.container}>
        <div>
          <Typography className={classes.heading} variant="h6">
            {heading}
          </Typography>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle1">{subheading}</Typography>
            </Grid>
          </Grid>
        </div>
        <div className={classes.flex} />
        {entities ? <ModelSchematic entities={entities} /> : null}
      </div>
    </>
  );
};

export default SectionHeading;
