import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const PaddedGridForm = styled.form`
  display: grid;
  grid-column-gap: 0.4rem;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  align-items: center;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  %row-style {
    &:hover {
      background-color: ${Colors['greyscale-grey3']};
    }
    &:first-child {
      border-top: 0.0625rem solid ${Colors['greyscale-grey3']};
    }
    border-bottom: 0.125rem solid ${Colors['greyscale-grey2']};
  }
  .row-style-even {
    @extend %row-style;
    &:nth-child(even) {
      background-color: ${Colors['greyscale-grey2']};
      &:hover {
        background-color: ${Colors['greyscale-grey3']};
      }
    }
  }
  .row-style-odd {
    @extend %row-style;
    &:nth-child(odd) {
      background-color: ${Colors['greyscale-grey2']};
      &:hover {
        background-color: ${Colors['greyscale-grey3']};
      }
    }
  }
  .row-height-4 {
    min-height: 4rem;
  }
`;
