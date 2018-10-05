import { ANALYTICS_URL } from './constants';

const useAnalytics = () => {
  return window.location.hostname === ANALYTICS_URL;
};

export default useAnalytics;
