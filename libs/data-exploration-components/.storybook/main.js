const rootMain = require('../../../.storybook/main');

module.exports = {
  ...rootMain,

  stories: [
    ...rootMain.stories,
    '../src/**/*.stories.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    ...rootMain.addons,
    '@nrwl/react/plugins/storybook',
  ],
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType });
    }

    // add your own webpack tweaks if needed
    config.module.rules.push({
      test: /\.pdf$/,
      use: ['file-loader'],
    });

    return config;
  },
};
