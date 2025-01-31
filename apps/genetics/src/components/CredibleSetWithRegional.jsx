import React from 'react';
import { Query } from '@apollo/client/react/components';
import { withStyles } from '@material-ui/core/styles';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
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
      <Accordion expanded={expanded}>
        <AccordionSummary
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
        </AccordionSummary>
        <AccordionDetails>
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
        </AccordionDetails>
      </Accordion>
    );
  }
}

export default withStyles(styles)(CredibleSetWithRegional);
