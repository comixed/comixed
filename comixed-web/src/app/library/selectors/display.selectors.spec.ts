import { DISPLAY_FEATURE_KEY, DisplayState } from '../reducers/display.reducer';
import { selectDisplayState } from './display.selectors';
import {
  PAGE_SIZE_DEFAULT,
  PAGINATION_DEFAULT
} from '@app/library/library.constants';

describe('Display Selectors', () => {
  let state: DisplayState;

  beforeEach(() => {
    state = { pageSize: PAGE_SIZE_DEFAULT, pagination: PAGINATION_DEFAULT };
  });

  it('should select the feature state', () => {
    expect(
      selectDisplayState({
        [DISPLAY_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
