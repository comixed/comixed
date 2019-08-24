import { SelectionState } from 'app/models/state/selection-state';
import {
  initial_state,
  selectionReducer
} from 'app/reducers/selection.reducer';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/library';
import * as SelectionActions from 'app/actions/selection.actions';

describe('selectionReducer', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];

  let state: SelectionState;

  beforeEach(() => {
    state = initial_state;
  });

  describe('the initial state', () => {
    it('has an empty selected comic set', () => {
      expect(state.selected_comics).toEqual([]);
    });
  });

  describe('resetting the selection list', () => {
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comics: COMICS },
        new SelectionActions.SelectionReset()
      );
    });

    it('clears the selected comic set', () => {
      expect(state.selected_comics).toEqual([]);
    });
  });
});
