import { createGlobalStyle } from 'styled-components/macro';
import layers from 'utils/zindex';

export default createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: "proxima-nova", sans-serif !important;

    // Keep the tabs dropdown in front of all other elements
    .rc-tabs-dropdown:not(.rc-tabs-dropdown-hidden) {
      z-index: ${layers.MAXIMUM}
    }
  }
`;
