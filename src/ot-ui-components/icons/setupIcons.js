import { loadCSS } from 'fg-loadcss/src/loadCSS';

const setupIcons = () => {
  loadCSS(
    'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
    document.querySelector('#insertion-point-jss')
  );
};

export default setupIcons;
