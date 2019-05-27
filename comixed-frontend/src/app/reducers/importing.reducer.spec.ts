import { ImportState } from 'app/models/state/import-state';
import {
  importingReducer,
  initial_state
} from 'app/reducers/importing.reducer';
import * as ImportActions from 'app/actions/importing.actions';
import {
  EXISTING_COMIC_FILE_1,
  EXISTING_COMIC_FILE_2
} from 'app/models/import/comic-file.fixtures';

describe('importingReducer', () => {
  const DIRECTORY = '/Users/comixed/library';
  let state: ImportState;

  beforeEach(() => {
    state = initial_state;
  });

  describe('when fetching pending imports', () => {
    beforeEach(() => {
      state = importingReducer(
        state,
        new ImportActions.ImportingGetPendingImports()
      );
    });

    it('sets the updating status', () => {
      expect(state.updating_status).toBeTruthy();
    });
  });

  describe('when setting the directory', () => {
    beforeEach(() => {
      state = importingReducer(
        state,
        new ImportActions.ImportingSetDirectory({ directory: DIRECTORY })
      );
    });

    it('sets the directory on the state', () => {
      expect(state.directory).toEqual(DIRECTORY);
    });
  });

  describe('when fetching files', () => {
    beforeEach(() => {
      state = importingReducer(
        state,
        new ImportActions.ImportingFetchFiles({ directory: DIRECTORY })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('sets the directory', () => {
      expect(state.directory).toEqual(DIRECTORY);
    });
  });

  describe('when receiving fetched files', () => {
    beforeEach(() => {
      state = importingReducer(
        state,
        new ImportActions.ImportingFilesFetched({
          files: [EXISTING_COMIC_FILE_1, EXISTING_COMIC_FILE_2]
        })
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('sets the files on the state', () => {
      expect(state.files).toEqual([
        EXISTING_COMIC_FILE_1,
        EXISTING_COMIC_FILE_2
      ]);
    });
  });

  describe('when selecting files', () => {
    beforeEach(() => {
      state.files = [EXISTING_COMIC_FILE_1, EXISTING_COMIC_FILE_2];
      state.selected_count = 0;
      state = importingReducer(
        state,
        new ImportActions.ImportingSelectFiles({
          files: [EXISTING_COMIC_FILE_1, EXISTING_COMIC_FILE_2]
        })
      );
    });

    it('updates the selected file count', () => {
      expect(state.selected_count).toEqual(2);
    });
  });

  describe('when unselecting files', () => {
    beforeEach(() => {
      state.files = [EXISTING_COMIC_FILE_1, EXISTING_COMIC_FILE_2];
      EXISTING_COMIC_FILE_1.selected = true;
      EXISTING_COMIC_FILE_2.selected = true;
      state.selected_count = 2;
      state = importingReducer(
        state,
        new ImportActions.ImportingUnselectFiles({
          files: [EXISTING_COMIC_FILE_1]
        })
      );
    });

    it('updates the selected file count', () => {
      expect(state.selected_count).toEqual(1);
    });
  });

  describe('when importing selected files', () => {
    beforeEach(() => {
      state = importingReducer(
        state,
        new ImportActions.ImportingImportFiles({
          files: [EXISTING_COMIC_FILE_1.filename],
          ignore_metadata: false
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });
  });

  describe('when files are imported', () => {
    beforeEach(() => {
      state = importingReducer(
        state,
        new ImportActions.ImportingFilesAreImporting()
      );
    });

    it('unsets the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('resets the selected count', () => {
      expect(state.selected_count).toEqual(0);
    });

    it('clears the available file set', () => {
      expect(state.files).toEqual([]);
    });
  });
});
