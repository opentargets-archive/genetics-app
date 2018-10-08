import React from 'react';
import GoogleAnalytics from 'react-ga';

import { ANALYTICS_TOKEN } from './constants';
import useAnalytics from './useAnalytics';
import reportAnalyticsEvent from './reportAnalyticsEvent';

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
    constructor(props) {
      super(props);
      this.state = { loadedAt: new Date() };
    }
    componentDidMount() {
      const page = this.props.location.pathname;
      trackPage(page);
    }
    componentWillUnmount() {
      const page = this.props.location.pathname;
      const unmountedAt = new Date();
      const duration = unmountedAt - this.state.loadedAt;
      reportAnalyticsEvent({
        category: 'page',
        action: 'leave',
        label: page,
        value: duration,
      });
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
