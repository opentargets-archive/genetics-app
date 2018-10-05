import React from 'react';
import GoogleAnalytics from 'react-ga';

import { ANALYTICS_TOKEN } from './constants';
import useAnalytics from './useAnalytics';

if (useAnalytics()) {
  GoogleAnalytics.initialize(ANALYTICS_TOKEN);
}

// see https://github.com/react-ga/react-ga/issues/122

const withPageAnalytics = (WrappedComponent, options = {}) => {
  // only track on production
  if (!useAnalytics()) {
    return WrappedComponent;
  }

  const trackPage = page => {
    GoogleAnalytics.set({
      page,
      ...options,
    });
    GoogleAnalytics.pageview(page);
  };

  const HOC = class extends React.Component {
    componentDidMount() {
      const page = this.props.location.pathname;
      trackPage(page);
    }

    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.location.pathname;
      const nextPage = nextProps.location.pathname;

      if (currentPage !== nextPage) {
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
};

export default withPageAnalytics;
