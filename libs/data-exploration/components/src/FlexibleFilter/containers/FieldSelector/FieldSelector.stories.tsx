import { ComponentStory } from '@storybook/react';

import { FieldSelector } from './FieldSelector';

export default {
  title: 'Components/FlexibleFilter/Containers/FieldSelector',
  component: FieldSelector,
};

export const Example: ComponentStory<typeof FieldSelector> = (args) => (
  <FieldSelector {...args} />
);
Example.args = {
  name: 'Movies',
  fields: [
    { name: 'Title', type: 'string' },
    { name: 'Gross', type: 'number' },
    { name: 'Boolean', type: 'boolean' },
    { name: 'Date', type: 'date' },
  ],
};
