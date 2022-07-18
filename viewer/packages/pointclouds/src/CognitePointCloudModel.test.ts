/*!
 * Copyright 2022 Cognite AS
 */

import { createPointCloudModel } from '../../../test-utilities/src/createPointCloudModel';
import { CognitePointCloudModel } from './CognitePointCloudModel';

describe(CognitePointCloudModel.name, () => {
  let model: CognitePointCloudModel;

  beforeEach(() => {
    model = createPointCloudModel(1, 2);
  });

  test('default CognitePointCloudModel does not contain annotations', () => {
    expect(model.stylableObjectCount).toEqual(0);
  });
});
