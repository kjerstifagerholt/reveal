import sample from 'lodash/sample';

const RANDOM_TRACK_COLORS_PALETTE = [
  '#0000ff',
  '#a52a2a',
  '#00008b',
  '#008b8b',
  '#797979',
  '#006400',
  '#bdb76b',
  '#8b008b',
  '#556b2f',
  '#ff8c00',
  '#9932cc',
  '#8b0000',
  '#ef967a',
  '#9400d3',
  '#ff00ff',
  '#ffc700',
  '#008000',
  '#4b0082',
  '#00c090',
  '#00df00',
  '#ff00ff',
  '#800000',
  '#000080',
  '#808000',
  '#ffa500',
  '#800080',
  '#ff0000',
  '#ffab00',
];

export const getRandomTrackColor = () => sample(RANDOM_TRACK_COLORS_PALETTE);
