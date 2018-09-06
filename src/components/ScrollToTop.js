import { Component } from 'react';
import { withRouter } from 'react-router';

class ScrollToTop extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps) {
    const { onRouteChange, location } = this.props;
    if (onRouteChange && location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return null;
  }
}

export default withRouter(ScrollToTop);
