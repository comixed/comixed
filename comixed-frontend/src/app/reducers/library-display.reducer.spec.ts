/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { LibraryDisplay } from 'app/models/state/library-display';
import { initial_state, libraryDisplayReducer } from 'app/reducers/library-display.reducer';
import * as DisplayActions from 'app/actions/library-display.actions';
import { READER_USER } from 'app/models/user/user.fixtures';
import { Preference } from 'app/models/user/preference';

fdescribe('libraryDisplayReducer', () => {
  let state: LibraryDisplay;

  beforeEach(() => {
    state = initial_state;
  });

  describe('when using the default state', () => {
    it('sets the layout to the default', () => {
      expect(state.layout).toEqual('grid');
    });

    it('sets sorting comics to the default', () => {
      expect(state.sort_field).toEqual('added_date');
    });

    it('sets sorting import files to the default', () => {
      expect(state.comic_file_sort_field).toEqual('filename');
    });

    it('sets the number of rows to the default', () => {
      expect(state.rows).toEqual(10);
    });

    it('sets the cover size to the default', () => {
      expect(state.cover_size).toEqual(225);
    });

    it('sets using the same height to the default', () => {
      expect(state.same_height).toBeTruthy();
    });
  });

  describe('when setting the layout', () => {
    it('sets the layout to list', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewLayout({ layout: 'list' }));
      expect(state.layout).toEqual('list');
    });

    it('sets the layout to grid', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewLayout({ layout: 'grid' }));
      expect(state.layout).toEqual('grid');
    });
  });

  describe('when setting the comic list sort', () => {
    it('sets the sort field to the volume', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewSort({ sort_field: 'volume' }));
      expect(state.sort_field).toEqual('volume');
    });

    it('sets the sort field to the issue number', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewSort({ sort_field: 'issue_number' }));
      expect(state.sort_field).toEqual('issue_number');
    });

    it('sets the sort field to the added date', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewSort({ sort_field: 'added_date' }));
      expect(state.sort_field).toEqual('added_date');
    });

    it('sets the sort field to the cover date', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewSort({ sort_field: 'cover_date' }));
      expect(state.sort_field).toEqual('cover_date');
    });

    it('sets the sort field to the last read date', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewSort({ sort_field: 'last_read_date' }));
      expect(state.sort_field).toEqual('last_read_date');
    });
  });

  describe('when setting the import file sort', () => {
    it('sets the sort field to the filename', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryComicFileViewSort({ comic_file_sort_field: 'filename' }));
      expect(state.comic_file_sort_field).toEqual('filename');
    });

    it('sets the sort field to the file size', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryComicFileViewSort({ comic_file_sort_field: 'size' }));
      expect(state.comic_file_sort_field).toEqual('size');
    });
  });

  describe('when setting the number of rows', () => {
    it('sets the number of rows to 10', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewRows({ rows: 10 }));
      expect(state.rows).toEqual(10);
    });

    it('sets the number of rows to 10', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewRows({ rows: 25 }));
      expect(state.rows).toEqual(25);
    });

    it('sets the number of rows to 10', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewRows({ rows: 50 }));
      expect(state.rows).toEqual(50);
    });

    it('sets the number of rows to 10', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewRows({ rows: 100 }));
      expect(state.rows).toEqual(100);
    });
  });

  describe('when setting the cover size', () => {
    it('accepts values within the allowed range', () => {
      const size = Math.floor(Math.random() * 300) + 100; // 100-400
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewCoverSize({ cover_size: size }));
      expect(state.cover_size).toEqual(size);
    });
  });

  describe('when setting using the same height', () => {
    it('sets the value to on', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewUseSameHeight({ same_height: true }));
      expect(state.same_height).toBeTruthy();
    });

    it('sets the value to off', () => {
      state = libraryDisplayReducer(state, new DisplayActions.SetLibraryViewUseSameHeight({ same_height: false }));
      expect(state.same_height).toBeFalsy();
    });
  });

  describe('when a user logs in', () => {
    const user = READER_USER;

    beforeEach(() => {
      state = libraryDisplayReducer(state, new DisplayActions.LibraryViewLoadUserOptions({ user: user }));
    });

    it('sets the layout', () => {
      expect(state.layout).toEqual(user.preferences.find(pref => pref.name === 'library_display_layout').value);
    });

    it('sets the sort field', () => {
      expect(state.sort_field).toEqual(user.preferences.find(pref => pref.name === 'library_display_sort_field').value);
    });

    it('sets the comic file sort field', () => {
      expect(state.comic_file_sort_field).toEqual(user.preferences.find((pref: Preference) => {
        return (pref.name === 'library_display_comic_file_sort_field');
      }).value);
    });

    it('sets the rows', () => {
      expect(state.rows).toEqual(parseInt(user.preferences.find(pref => pref.name === 'library_display_rows').value, 10));
    });

    it('sets the cover size', () => {
      expect(state.cover_size).toEqual(parseInt(user.preferences.find(pref => pref.name === 'library_display_cover_size').value, 10));
    });

    it('sets using the same height', () => {
      expect(state.same_height).toBeFalsy();
    });
  });

  describe('when a user logs out', () => {
    beforeEach(() => {
      state = libraryDisplayReducer(state, new DisplayActions.LibraryViewLoadUserOptions({ user: null }));
    });

    it('sets the layout', () => {
      expect(state.layout).toEqual(initial_state.layout);
    });

    it('sets the sort field', () => {
      expect(state.sort_field).toEqual(initial_state.sort_field);
    });

    it('sets the rows', () => {
      expect(state.rows).toEqual(initial_state.rows);
    });

    it('sets the cover size', () => {
      expect(state.cover_size).toEqual(initial_state.cover_size);
    });

    it('sets using the same height', () => {
      expect(state.same_height).toEqual(initial_state.same_height);
    });
  });

  describe('when toggling the selection sidebar', () => {
    it('can show the sidebar', () => {
      state = libraryDisplayReducer(state, new DisplayActions.LibraryViewToggleSidebar({ show: true }));
      expect(state.show_selections).toBeTruthy();
    });

    it('can hide the sidebar', () => {
      state = libraryDisplayReducer(state, new DisplayActions.LibraryViewToggleSidebar({ show: false }));
      expect(state.show_selections).toBeFalsy();
    });
  });
});
