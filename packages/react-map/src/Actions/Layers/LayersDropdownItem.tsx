import { Body, Checkbox } from '@cognite/cogs.js';

import { SelectableLayer } from '../../layers/types';

import { LayerItem } from './elements';

export const LayersDropdownItem = ({
  item,
  onChange,
}: {
  item: SelectableLayer;
  onChange: (layer: SelectableLayer) => void;
}) => {
  const handleChange = () => onChange(item);

  return (
    <LayerItem>
      <Checkbox
        name={item.id}
        data-testid={`layer-${item.id}`}
        checked={item.selected}
        disabled={item.disabled || false}
        onChange={handleChange}
        color={item.color === 'transparent' ? 'black' : item.color}
      >
        <Body level={2} as="span">
          {item.name}
        </Body>
      </Checkbox>
    </LayerItem>
  );
};
