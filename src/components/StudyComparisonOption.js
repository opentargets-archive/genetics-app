import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';

const styles = theme => ({
  option: {
    width: '600px',
    maxWidth: '600px',
    minWidth: '600px',
    fontSize: '0.8rem',
    padding: '5px 5px',
    marginLeft: '2px',
    marginBottom: '2px',
    marginTop: '2px',
    fontWeight: 400,
    borderLeft: `4px solid ${theme.palette.grey[500]}`,
    lineHeight: 'normal',
    whiteSpace: 'normal',
  },
  optionSelected: {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    fontWeight: 500,
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
  heading: {
    fontWeight: 'bold',
  },
  small: {
    color: theme.palette.grey[800],
    fontSize: '0.7rem',
  },
  subContainer: {
    maxWidth: 'calc(100% - 16px)',
  },
});

const Option = ({ classes, data }) => (
  <div
    className={classNames(classes.option, {
      [classes.optionSelected]: data.selected,
    })}
  >
    <div className={classes.subContainer}>
      <div className={classes.heading}>{data.study.traitReported}</div>
      <span className={classes.small}>
        {data.study.pubAuthor} {new Date(data.study.pubDate).getFullYear()}
      </span>
      {data.count ? (
        <span className={classNames(classes.count, classes.small)}>
          {data.count} overlapping loci
        </span>
      ) : null}
    </div>
    {data.proportion ? (
      <div className={classes.proportionContainer}>
        <div
          className={classes.proportion}
          style={{ width: `${data.proportion * 100}%` }}
        />
        <div className={classes.proportionRemainder} />
      </div>
    ) : null}
  </div>
);

export default withStyles(styles)(Option);
