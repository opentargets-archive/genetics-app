import React from 'react';
import { Query } from 'react-apollo';

import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';

import CredibleSet from './CredibleSet';
import Regional from './Regional';

const styles = () => ({
  container: {
    width: '100%',
    maxWidth: '100%',
  },
});

class CredibleSetWithRegional extends React.Component {
  state = {
    expanded: false,
  };
  render() {
    const {
      classes,
      checkboxProps,
      credibleSetProps,
      regionalProps,
    } = this.props;
    const { expanded } = this.state;
    const { query, variables, start, end, ...rest } = regionalProps;
    return (
      <ExpansionPanel expanded={expanded}>
        <ExpansionPanelSummary
          style={{ cursor: 'default' }}
          expandIcon={
            <ExpandMoreIcon
              onClick={() => {
                this.setState({
                  expanded: !this.state.expanded,
                });
              }}
            />
          }
        >
          {checkboxProps ? (
            <div
              style={{ position: 'absolute', zIndex: 1000 }}
              onClick={e => e.stopPropagation()}
            >
              <Checkbox {...checkboxProps} />
            </div>
          ) : null}

          <CredibleSet {...credibleSetProps} />
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {expanded && (
            <Query query={query} variables={variables}>
              {({ loading, error, data }) => {
                if (loading || error) {
                  return null;
                }

                return (
                  <div className={classes.container}>
                    <Regional
                      {...{
                        data: data.regional.map(({ variant, pval }) => ({
                          pval,
                          ...variant,
                        })),
                        start,
                        end,
                        ...rest,
                      }}
                    />
                  </div>
                );
              }}
            </Query>
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(CredibleSetWithRegional);
