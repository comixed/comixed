import { SelectionState } from 'app/models/state/selection-state';
import * as SelectionActions from 'app/actions/selection.actions';
import { Comic } from 'app/library';
import { ComicFile } from 'app/models/import/comic-file';

export const initial_state: SelectionState = {
  selected_comics: [],
  selected_comic_files: []
};

export function selectionReducer(
  state: SelectionState = initial_state,
  action: SelectionActions.Actions
): SelectionState {
  switch (action.type) {
    case SelectionActions.SELECTION_RESET:
      return { ...state, selected_comics: [] };

    case SelectionActions.SELECTION_ADD_COMICS: {
      const comics = state.selected_comics;
      (action.payload.comics || []).forEach((comic: Comic) => {
        if (!comics.includes(comic)) {
          comics.push(comic);
        }
      });

      return {
        ...state,
        selected_comics: comics
      };
    }

    case SelectionActions.SELECTION_REMOVE_COMICS:
      return {
        ...state,
        selected_comics: state.selected_comics.filter(
          comic => !action.payload.comics.includes(comic)
        )
      };

    case SelectionActions.SELECTION_ADD_COMIC_FILES: {
      const comic_files = state.selected_comic_files;
      (action.payload.comic_files || []).forEach((comic_file: ComicFile) => {
        if (!comic_files.includes(comic_file)) {
          comic_files.push(comic_file);
        }
      });
      return { ...state, selected_comic_files: comic_files };
    }

    case SelectionActions.SELECTION_REMOVE_COMIC_FILES: {
      const comic_files = state.selected_comic_files.filter(
        comic_file => !action.payload.comic_files.includes(comic_file)
      );
      return {
        ...state,
        selected_comic_files: comic_files
      };
    }

    default:
      return state;
  }
}
