import { SelectionState } from 'app/models/state/selection-state';
import * as SelectionActions from 'app/actions/selection.actions';
import { Comic } from 'app/library';

export const initial_state: SelectionState = {
  selected_comics: []
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

    default:
      return state;
  }
}
