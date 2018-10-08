import GoogleAnalytics from 'react-ga';
import useAnalytics from './useAnalytics';

const reportAnalyticsEvent = options => {
  // report to analytics if production
  if (useAnalytics()) {
    GoogleAnalytics.event(options);
  }
};

export default reportAnalyticsEvent;
