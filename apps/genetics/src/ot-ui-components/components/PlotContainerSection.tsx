import { makeStyles } from '@material-ui/core/styles';
import { ReactNode } from 'react';

const useStyles = makeStyles(theme => ({
  plotContainerSection: {
    padding: '4px 0',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
}));

type PlotContainerSectionProps = {
  children: ReactNode;
};
const PlotContainerSection = ({ children }: PlotContainerSectionProps) => {
  const classes = useStyles();
  return <div className={classes.plotContainerSection}>{children}</div>;
};

export default PlotContainerSection;
