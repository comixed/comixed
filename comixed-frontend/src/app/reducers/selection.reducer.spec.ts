import { SelectionState } from 'app/models/state/selection-state';
import {
  initial_state,
  selectionReducer
} from 'app/reducers/selection.reducer';
import {
  COMIC_1000,
  COMIC_1002,
  COMIC_1004
} from 'app/models/comics/comic.fixtures';
import * as SelectionActions from 'app/actions/selection.actions';
import {
  EXISTING_COMIC_FILE_1,
  EXISTING_COMIC_FILE_2,
  EXISTING_COMIC_FILE_3,
  EXISTING_COMIC_FILE_4
} from 'app/models/import/comic-file.fixtures';

describe('selectionReducer', () => {
  const COMICS = [COMIC_1000, COMIC_1002, COMIC_1004];
  const COMIC_FILES = [EXISTING_COMIC_FILE_1, EXISTING_COMIC_FILE_3];

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

    it('clears the selected comic file set', () => {
      expect(state.selected_comic_files).toEqual([]);
    });
  });

  describe('selecting comic files', () => {
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comics: [] },
        new SelectionActions.SelectionAddComicFiles({
          comic_files: COMIC_FILES
        })
      );
    });

    it('adds the files to the comic file set', () => {
      expect(state.selected_comic_files).toEqual(COMIC_FILES);
    });
  });

  describe('selecting an additional comic file', () => {
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comic_files: COMIC_FILES },
        new SelectionActions.SelectionAddComicFiles({
          comic_files: [EXISTING_COMIC_FILE_2]
        })
      );
    });

    it('adds the files to the selected comic files', () => {
      expect(state.selected_comic_files).toContain(EXISTING_COMIC_FILE_2);
    });
  });

  describe('selecting an already selected comic file', () => {
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comic_files: COMIC_FILES },
        new SelectionActions.SelectionAddComicFiles({
          comic_files: [COMIC_FILES[0]]
        })
      );
    });

    it('does not add the comic twice', () => {
      expect(state.selected_comic_files).toEqual(COMIC_FILES);
    });
  });

  describe('removing comic files', () => {
    const INCLUDED = [EXISTING_COMIC_FILE_1, EXISTING_COMIC_FILE_3];
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comic_files: INCLUDED },
        new SelectionActions.SelectionRemoveComicFiles({
          comic_files: [INCLUDED[0]]
        })
      );
    });

    it('removes the specified comic', () => {
      expect(state.selected_comic_files).not.toContain(EXISTING_COMIC_FILE_1);
    });
  });

  describe('removing an unselected comic file', () => {
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comic_files: COMIC_FILES },
        new SelectionActions.SelectionRemoveComicFiles({
          comic_files: [EXISTING_COMIC_FILE_4]
        })
      );
    });

    it('does not change the selected file state', () => {
      expect(state.selected_comic_files).toEqual(COMIC_FILES);
    });
  });

  describe('removing all comic files', () => {
    beforeEach(() => {
      state = selectionReducer(
        { ...state, selected_comic_files: COMIC_FILES },
        new SelectionActions.SelectionRemoveComicFiles({
          comic_files: COMIC_FILES
        })
      );
    });

    it('should have no selections', () => {
      expect(state.selected_comic_files).toEqual([]);
    });
  });
});
