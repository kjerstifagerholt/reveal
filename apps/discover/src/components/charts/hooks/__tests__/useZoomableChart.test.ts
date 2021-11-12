import { renderHook } from '@testing-library/react-hooks';

import {
  Data,
  data,
  margins,
  accessors,
  spacings,
  xScaleMaxValue,
} from '__test-utils/fixtures/charts';

import { useZoomableChart } from '../useZoomableChart';

describe('useZoomableChart hook', () => {
  const getHookResult = () => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useZoomableChart<Data>({
        data,
        chartRef: jest.fn() as any,
        margins,
        accessors,
        spacings,
        xScaleMaxValue,
        zoomStepSize: 100,
      })
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should return the initial result as expected', () => {
    const {
      chartDimensions,
      zoomIn,
      zoomOut,
      resetZoom,
      disableZoomIn,
      disableZoomOut,
      zoomFactor,
    } = getHookResult();

    expect(chartDimensions).toBeTruthy();
    expect(zoomIn).toBeTruthy();
    expect(zoomOut).toBeTruthy();
    expect(resetZoom).toBeTruthy();

    // Following should have the boolean value `false` initially in this case since the width of chart is undefined.
    expect(disableZoomIn).toBeFalsy();
    expect(disableZoomOut).toBeFalsy();

    // Initial zoom factor.
    expect(zoomFactor).toEqual(1);
  });
});
