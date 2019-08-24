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

import { SelectionAdaptor } from './selection.adaptor';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  COMIC_1,
  COMIC_3,
  COMIC_5,
  COMIC_FILE_1,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/library';
import { Store, StoreModule } from '@ngrx/store';
import { reducer } from 'app/library/reducers/selection.reducer';
import { AppState } from 'app/library';
import * as SelectActions from 'app/library/actions/selection.actions';
import {
  SelectBulkRemoveComicFiles,
  SelectBulkRemoveComics,
  SelectRemoveComic
} from 'app/library/actions/selection.actions';
import { SelectBulkAddComics } from 'app/library/actions/selection.actions';
import { utils } from 'protractor';
import { SelectionState } from 'app/library/models/selection-state';

describe('SelectionAdaptor', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_4];

  let adaptor: SelectionAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ selection_state: reducer })],
      providers: [SelectionAdaptor]
    });

    adaptor = TestBed.get(SelectionAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch');
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  it('provides notifications of comic selection changes', () => {
    adaptor._comic_selection$.next([COMIC_1]);
    adaptor.comic_selection$.subscribe(selections =>
      expect(selections).toEqual([COMIC_1])
    );
  });

  it('sends a notification when the comics have changed', () => {
    adaptor._comic_selection$.next([]);
    spyOn(adaptor._comic_selection$, 'next');
    adaptor.update_state({
      comics: COMICS,
      comic_files: []
    } as SelectionState);
    expect(adaptor._comic_selection$.next).toHaveBeenCalledWith(COMICS);
  });

  it('fires an action when a comic is selected', () => {
    adaptor.select_comic(COMIC_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectAddComic({ comic: COMIC_1 })
    );
  });

  it('fires an action when comics are bulk added', () => {
    adaptor.select_comics([COMIC_1, COMIC_3, COMIC_5]);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectBulkAddComics({
        comics: [COMIC_1, COMIC_3, COMIC_5]
      })
    );
  });

  it('fires an action when a comic is deselected', () => {
    adaptor.deselect_comic(COMIC_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectRemoveComic({ comic: COMIC_1 })
    );
  });

  it('fires an action when comics are deselected in bulk', () => {
    adaptor.deselect_comics(COMICS);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectBulkRemoveComics({ comics: COMICS })
    );
  });

  it('fires an action when the selections are cleared', () => {
    adaptor.deselect_all_comics();
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectRemoveAllComics()
    );
  });

  it('provides notifications of comic file selection changes', () => {
    adaptor._comic_file_selection$.next([COMIC_FILE_1]);
    adaptor.comic_file_selection$.subscribe(selections =>
      expect(selections).toEqual([COMIC_FILE_1])
    );
  });

  it('sends a notification when the comic files have changed', () => {
    adaptor._comic_file_selection$.next([]);
    spyOn(adaptor._comic_file_selection$, 'next');
    adaptor.update_state({
      comic_files: COMIC_FILES,
      comics: []
    } as SelectionState);
    expect(adaptor._comic_file_selection$.next).toHaveBeenCalledWith(
      COMIC_FILES
    );
  });

  it('fires an action when a comic file is selected', () => {
    adaptor.select_comic_file(COMIC_FILE_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectAddComicFile({ comic_file: COMIC_FILE_1 })
    );
  });

  it('fires an action when comic files are bulk added', () => {
    adaptor.select_comic_files([COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_4]);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectBulkAddComicFiles({
        comic_files: [COMIC_FILE_1, COMIC_FILE_3, COMIC_FILE_4]
      })
    );
  });

  it('fires an action when a comic file is deselected', () => {
    adaptor.deselect_comic_file(COMIC_FILE_1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectRemoveComicFile({ comic_file: COMIC_FILE_1 })
    );
  });

  it('fires an action when comic files are deselected in bulk', () => {
    adaptor.deselect_comic_files(COMIC_FILES);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectBulkRemoveComicFiles({ comic_files: COMIC_FILES })
    );
  });

  it('fires an action when the comic file selections are cleared', () => {
    adaptor.deselect_all_comic_files();
    expect(store.dispatch).toHaveBeenCalledWith(
      new SelectActions.SelectRemoveAllComicFiles()
    );
  });
});
