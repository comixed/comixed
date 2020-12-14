import { DISPLAY_FEATURE_KEY, DisplayState } from '../reducers/display.reducer';
import { selectDisplayState } from './display.selectors';
import { DEFAULT_PAGE_SIZE } from '@app/library/library.constants';

describe('Display Selectors', () => {
  let state: DisplayState;

  beforeEach(() => {
    state = { pageSize: DEFAULT_PAGE_SIZE };
  });

  it('should select the feature state', () => {
    expect(
      selectDisplayState({
        [DISPLAY_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
