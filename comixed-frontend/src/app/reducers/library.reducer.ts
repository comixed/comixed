/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ComicGrouping, Library } from 'app/models/actions/library';
import { Comic } from 'app/models/comics/comic';
import * as LibraryActions from 'app/actions/library.actions';

const initial_state: Library = {
  busy: false,
  library_state: {
    import_count: 0,
    rescan_count: 0,
    comics: []
  },
  last_comic_date: '0',
  scan_types: [],
  formats: [],
  comics: [],
  selected_comics: [],
  publishers: [],
  series: [],
  characters: [],
  teams: [],
  locations: [],
  story_arcs: [],
  last_read_dates: []
};

export function libraryReducer(
  state: Library = initial_state,
  action: LibraryActions.Actions
) {
  switch (action.type) {
    case LibraryActions.LIBRARY_GET_SCAN_TYPES:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_SET_SCAN_TYPES:
      return {
        ...state,
        busy: false,
        scan_types: action.payload.scan_types
      };

    case LibraryActions.LIBRARY_SET_SCAN_TYPE:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_SCAN_TYPE_SET: {
      action.payload.comic.scan_type = action.payload.scan_type;

      return {
        ...state,
        busy: false
      };
    }

    case LibraryActions.LIBRARY_GET_FORMATS:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_SET_FORMATS:
      return {
        ...state,
        busy: false,
        formats: action.payload.formats
      };

    case LibraryActions.LIBRARY_SET_FORMAT:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_FORMAT_SET: {
      action.payload.comic.format = action.payload.format;

      return {
        ...state,
        busy: false
      };
    }

    case LibraryActions.LIBRARY_SET_SORT_NAME:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_SORT_NAME_SET: {
      action.payload.comic.sort_name = action.payload.sort_name;

      return {
        ...state,
        busy: false
      };
    }

    case LibraryActions.LIBRARY_FETCH_LIBRARY_CHANGES:
      return {
        ...state,
        busy: true,
        latest_comic_update: action.payload.last_comic_date
      };

    case LibraryActions.LIBRARY_MERGE_NEW_COMICS:
      const comics = state.comics;
      if (action.payload.library_state.comics.length > 0) {
        // merge the new comics into the existing comics
        action.payload.library_state.comics.forEach((comic: Comic) => {
          // if we already have the comic then merge their content, otherwise add it to the library
          const index = comics.findIndex((found: Comic) => {
            return found.id === comic.id;
          });
          if (index !== -1) {
            Object.assign(comics[index], comic);
          } else {
            comics.push(comic);
          }
        });
      }

      const publishers = [];
      const series = [];
      const characters = [];
      const teams = [];
      const locations = [];
      const story_arcs = [];
      comics.forEach((comic: Comic) => {
        let entry: ComicGrouping = null;

        entry = publishers.find((grouping: ComicGrouping) => {
          return grouping.name === comic.publisher;
        });

        if (entry) {
          entry.comic_count += 1;
          if (comic.added_date > entry.latest_comic_date) {
            entry.latest_comic_date = comic.added_date;
          }
        } else {
          publishers.push({
            name: comic.publisher,
            comic_count: 1,
            latest_comic_date: comic.added_date
          });
        }

        entry = series.find((grouping: ComicGrouping) => {
          return grouping.name === comic.series;
        });

        if (entry) {
          entry.comic_count += 1;
          if (comic.added_date > entry.latest_comic_date) {
            entry.latest_comic_date = comic.added_date;
          }
        } else {
          series.push({
            name: comic.series,
            comic_count: 1,
            latest_comic_date: comic.added_date
          });
        }

        comic.characters.forEach((character: string) => {
          entry = characters.find((grouping: ComicGrouping) => {
            return grouping.name === character;
          });

          if (entry) {
            entry.comic_count += 1;
            if (comic.added_date > entry.latest_comic_date) {
              entry.latest_comic_date = comic.added_date;
            }
          } else {
            characters.push({
              name: character,
              comic_count: 1,
              latest_comic_date: comic.added_date
            });
          }
        });

        comic.teams.forEach((team: string) => {
          entry = teams.find((grouping: ComicGrouping) => {
            return grouping.name === team;
          });

          if (entry) {
            entry.comic_count += 1;
            if (comic.added_date > entry.latest_comic_date) {
              entry.latest_comic_date = comic.added_date;
            }
          } else {
            teams.push({
              name: team,
              comic_count: 1,
              latest_comic_date: comic.added_date
            });
          }
        });

        comic.locations.forEach((location: string) => {
          entry = locations.find((grouping: ComicGrouping) => {
            return grouping.name === location;
          });

          if (entry) {
            entry.comic_count += 1;
            if (comic.added_date > entry.latest_comic_date) {
              entry.latest_comic_date = comic.added_date;
            }
          } else {
            locations.push({
              name: location,
              comic_count: 1,
              latest_comic_date: comic.added_date
            });
          }
        });

        comic.story_arcs.forEach((story_arc: string) => {
          entry = story_arcs.find((grouping: ComicGrouping) => {
            return grouping.name === story_arc;
          });

          if (entry) {
            entry.comic_count += 1;
            if (comic.added_date > entry.latest_comic_date) {
              entry.latest_comic_date = comic.added_date;
            }
          } else {
            story_arcs.push({
              name: story_arc,
              comic_count: 1,
              latest_comic_date: comic.added_date
            });
          }
        });
      });
      // find the latest comic date
      let last_comic = null;

      if (comics.length > 0) {
        last_comic =
          comics.reduce((last: Comic, current: Comic) => {
            const last_added_date = parseInt(last.added_date, 10);
            const curr_added_date = parseInt(current.added_date, 10);

            if (curr_added_date >= last_added_date) {
              return current;
            } else {
              return last;
            }
          }) || null;
      }
      const last_comic_date = last_comic === null ? '0' : last_comic.added_date;
      return {
        ...state,
        busy: false,
        library_state: action.payload.library_state,
        last_comic_date: last_comic_date,
        comics: comics,
        publishers: publishers,
        series: series,
        teams: teams,
        locations: locations,
        story_arcs: story_arcs,
        characters: characters
      };

    case LibraryActions.LIBRARY_REMOVE_COMIC: {
      return {
        ...state,
        busy: true
      };
    }

    case LibraryActions.LIBRARY_UPDATE_COMICS_REMOVE_COMIC: {
      const updated_comics = state.comics.filter(
        comic => comic.id !== action.payload.comic.id
      );
      const publisher_list = state.publishers.filter(
        (grouping: ComicGrouping) => {
          if (grouping.name === action.payload.comic.publisher) {
            grouping.comic_count -= 1;
          }

          return grouping.comic_count > 0;
        }
      );
      const series_list = state.series.filter((grouping: ComicGrouping) => {
        if (grouping.name === action.payload.comic.series) {
          grouping.comic_count -= 1;
        }

        return grouping.comic_count > 0;
      });
      const character_list = state.characters.filter(
        (grouping: ComicGrouping) => {
          action.payload.comic.characters.forEach((character: string) => {
            if (character === grouping.name) {
              grouping.comic_count -= 1;
            }
          });

          return grouping.comic_count > 0;
        }
      );

      const team_list = state.characters.filter((grouping: ComicGrouping) => {
        action.payload.comic.teams.forEach((team: string) => {
          if (team === grouping.name) {
            grouping.comic_count -= 1;
          }
        });

        return grouping.comic_count > 0;
      });

      const location_list = state.characters.filter(
        (grouping: ComicGrouping) => {
          action.payload.comic.locations.forEach((location: string) => {
            if (location === grouping.name) {
              grouping.comic_count -= 1;
            }
          });

          return grouping.comic_count > 0;
        }
      );

      const story_arc_list = state.story_arcs.filter(
        (grouping: ComicGrouping) => {
          action.payload.comic.story_arcs.forEach((story_arc: string) => {
            if (story_arc === grouping.name) {
              grouping.comic_count -= 1;
            }
          });

          return grouping.comic_count > 0;
        }
      );
      return {
        ...state,
        busy: false,
        comics: updated_comics,
        publishers: publisher_list,
        series: series_list,
        characters: character_list,
        teams: team_list,
        locations: location_list,
        story_arcs: story_arc_list
      };
    }

    case LibraryActions.LIBRARY_RESET:
      return {
        ...state,
        last_comic_date: '0',
        comics: [],
        publishers: [],
        series: [],
        characters: [],
        teams: [],
        locations: [],
        story_arcs: []
      };

    case LibraryActions.LIBRARY_CLEAR_METADATA:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_METADATA_CHANGED:
      return {
        ...state,
        busy: false
      };

    case LibraryActions.LIBRARY_RESCAN_FILES:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_SET_BLOCKED_PAGE_STATE:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_BLOCKED_PAGE_STATE_SET: {
      action.payload.page.blocked = action.payload.blocked_state;

      return {
        ...state,
        busy: false
      };
    }

    case LibraryActions.LIBRARY_SET_SELECTED: {
      const selected = state.selected_comics.filter((comic: Comic) => {
        return comic.id !== action.payload.comic.id;
      });

      if (action.payload.selected) {
        selected.unshift(action.payload.comic);
      }

      return {
        ...state,
        selected_comics: selected
      };
    }

    case LibraryActions.LIBRARY_RESET_SELECTED:
      return {
        ...state,
        selected_comics: []
      };

    case LibraryActions.LIBRARY_DELETE_MULTIPLE_COMICS:
      return {
        ...state,
        busy: true
      };

    case LibraryActions.LIBRARY_COMICS_DELETED: {
      const remaining_comics = state.comics.filter((comic: Comic) => {
        return action.payload.comics.includes(comic) === false;
      });

      return {
        ...state,
        busy: false,
        comics: remaining_comics,
        selected_comics: []
      };
    }

    default:
      return state;
  }
}
