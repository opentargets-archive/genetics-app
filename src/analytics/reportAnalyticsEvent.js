import GoogleAnalytics from 'react-ga';
import shouldUseAnalytics from './useAnalytics';

const reportAnalyticsEvent = options => {
  // report to analytics if production
  if (shouldUseAnalytics()) {
    GoogleAnalytics.event(options);
  }
};

export default reportAnalyticsEvent;
