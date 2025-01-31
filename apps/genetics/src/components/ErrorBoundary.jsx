import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import config from '../config';
import Link from './Link';

class ErrorBoundary extends Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    const {
      // public platform error message
      message = (
        <div>
          Something went wrong. Please{' '}
          <Link to={config.profile.communityTicketUrl} external>
            submit a bug report
          </Link>{' '}
          on the Open Targets Community ({config.profile.communityUrl})
        </div>
      ),
    } = this.props;

    return this.state.hasError ? (
      <Typography
        component="div"
        align="center"
        color="secondary"
        variant="caption"
      >
        {message}
      </Typography>
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
