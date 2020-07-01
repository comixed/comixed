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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'app/comic-import';
import {
  ComicImportDeselectFiles,
  ComicImportFilesReceived,
  ComicImportGetFiles,
  ComicImportGetFilesFailed,
  ComicImportReset,
  ComicImportSelectFiles,
  ComicImportSetDirectory,
  ComicImportStart,
  ComicImportStarted,
  ComicImportStartFailed
} from 'app/comic-import/actions/comic-import.actions';
import { ComicImportEffects } from 'app/comic-import/effects/comic-import.effects';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from 'app/comic-import/models/comic-file.fixtures';
import {
  COMIC_IMPORT_FEATURE_KEY,
  reducer
} from 'app/comic-import/reducers/comic-import.reducer';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { ComicImportAdaptor } from './comic-import.adaptor';

describe('ComicImportAdaptor', () => {
  const DIRECTORY = '/Users/comixedreader/Library';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_3];
  const COMIC_FILE = COMIC_FILE_2;
  const MAXIMUM = 13;

  let adaptor: ComicImportAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_IMPORT_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicImportEffects])
      ],
      providers: [ComicImportAdaptor, MessageService]
    });

    adaptor = TestBed.get(ComicImportAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('setting the import directory', () => {
    beforeEach(() => {
      adaptor.setDirectory(DIRECTORY);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicImportSetDirectory({ directory: DIRECTORY })
      );
    });

    it('provides an update on the directory', () => {
      adaptor.directory$.subscribe(response =>
        expect(response).toEqual(DIRECTORY)
      );
    });
  });

  describe('getting comic files', () => {
    beforeEach(() => {
      adaptor.getComicFiles(DIRECTORY, MAXIMUM);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicImportGetFiles({ directory: DIRECTORY, maximum: MAXIMUM })
      );
    });

    it('provides updates on fetching', () => {
      adaptor.fetchingComicFile$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when files are received', () => {
      beforeEach(() => {
        store.dispatch(
          new ComicImportFilesReceived({ comicFiles: COMIC_FILES })
        );
      });

      it('provides updates on fetching', () => {
        adaptor.fetchingComicFile$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the comic files', () => {
        adaptor.comicFile$.subscribe(response =>
          expect(response).toEqual(COMIC_FILES)
        );
      });

      it('provides updates on the selected comic files', () => {
        adaptor.selectedComicFile$.subscribe(response =>
          expect(response).toEqual([])
        );
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        store.dispatch(new ComicImportGetFilesFailed());
      });

      it('provides updates on fetching', () => {
        adaptor.fetchingComicFile$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('selecting comic files', () => {
    beforeEach(() => {
      adaptor.selectComicFiles([COMIC_FILE]);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicImportSelectFiles({ comicFiles: [COMIC_FILE] })
      );
    });

    it('provides updates on the selected comic files', () => {
      adaptor.selectedComicFile$.subscribe(response =>
        expect(response).toContain(COMIC_FILE)
      );
    });

    describe('deselecting a comic file', () => {
      beforeEach(() => {
        adaptor.deselectComicFiles([COMIC_FILE]);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ComicImportDeselectFiles({ comicFiles: [COMIC_FILE] })
        );
      });

      it('provides updates on the selected comic files', () => {
        adaptor.selectedComicFile$.subscribe(response =>
          expect(response).not.toContain(COMIC_FILE)
        );
      });
    });

    describe('clearing the selecting comic files list', () => {
      beforeEach(() => {
        adaptor.clearSelectedComicFiles();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(new ComicImportReset());
      });

      it('provides updates on the selected comic files', () => {
        adaptor.selectedComicFile$.subscribe(response =>
          expect(response).toEqual([])
        );
      });
    });
  });

  describe('starting the import process', () => {
    const IGNORE_METADATA = true;
    const DELETE_BLOCKED_FILES = false;

    beforeEach(() => {
      adaptor.startImport(COMIC_FILES, IGNORE_METADATA, DELETE_BLOCKED_FILES);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ComicImportStart({
          comicFiles: COMIC_FILES,
          ignoreMetadata: IGNORE_METADATA,
          deleteBlockedPages: DELETE_BLOCKED_FILES
        })
      );
    });

    it('provides updates on starting importing', () => {
      adaptor.startingImport$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('when the import successfully started', () => {
      beforeEach(() => {
        store.dispatch(new ComicImportStarted());
      });

      it('provides updates on starting importing', () => {
        adaptor.startingImport$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('when the import failed to start', () => {
      beforeEach(() => {
        store.dispatch(new ComicImportStartFailed());
      });

      it('provides updates on starting importing', () => {
        adaptor.startingImport$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
