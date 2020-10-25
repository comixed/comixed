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
import { ReadingListEffects } from 'app/library/effects/reading-list.effects';
import {
  READING_LIST_FEATURE_KEY,
  reducer
} from 'app/library/reducers/reading-list.reducer';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { ReadingListAdaptor } from './reading-list.adaptor';
import {
  ReadingListAddComics,
  ReadingListAddComicsFailed,
  ReadingListCancelEdit,
  ReadingListComicsAdded,
  ReadingListComicsRemoved,
  ReadingListCreate,
  ReadingListEdit,
  ReadingListRemoveComics,
  ReadingListRemoveComicsFailed,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed,
  ReadingListToggleSelectDialog
} from 'app/library/actions/reading-list.actions';
import { LibraryModuleState } from 'app/library';
import { NEW_READING_LIST } from 'app/library/library.constants';
import { READING_LIST_1 } from 'app/comics/models/reading-list.fixtures';
import { ReadingList } from 'app/comics/models/reading-list';
import { COMIC_1, COMIC_2, COMIC_3 } from 'app/comics/comics.fixtures';

describe('ReadingListAdaptor', () => {
  const READING_LIST = READING_LIST_1;
  const READING_LIST_ID = READING_LIST.id;
  const READING_LIST_NAME = READING_LIST.name;
  const READING_LIST_SUMMARY = READING_LIST.summary;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];

  let adaptor: ReadingListAdaptor;
  let store: Store<LibraryModuleState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(READING_LIST_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ReadingListEffects])
      ],
      providers: [ReadingListAdaptor, MessageService]
    });

    adaptor = TestBed.get(ReadingListAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('creating a new reading list', () => {
    beforeEach(() => {
      adaptor.create();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new ReadingListCreate());
    });

    it('provides updates on the reading list', () => {
      adaptor.current$.subscribe(response =>
        expect(response).toEqual(NEW_READING_LIST)
      );
    });

    it('provides updates on editing', () => {
      adaptor.editingList$.subscribe(response => expect(response).toBeTruthy());
    });
  });

  describe('editing a reading list', () => {
    beforeEach(() => {
      adaptor.edit(READING_LIST);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ReadingListEdit({ readingList: READING_LIST })
      );
    });

    it('provides updates on the reading list', () => {
      adaptor.current$.subscribe(response =>
        expect(response).toEqual(READING_LIST)
      );
    });

    it('provides updates on editing', () => {
      adaptor.editingList$.subscribe(response => expect(response).toBeTruthy());
    });

    describe('canceling the edit', () => {
      beforeEach(() => {
        adaptor.cancelEdit();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ReadingListCancelEdit()
        );
      });

      it('provides updates on editing', () => {
        adaptor.editingList$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('saving a reading list', () => {
      beforeEach(() => {
        adaptor.save(READING_LIST_ID, READING_LIST_NAME, READING_LIST_SUMMARY);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ReadingListSave({
            id: READING_LIST_ID,
            name: READING_LIST_NAME,
            summary: READING_LIST_SUMMARY
          })
        );
      });

      it('provides updates on saving', () => {
        adaptor.savingList$.subscribe(response =>
          expect(response).toBeTruthy()
        );
      });

      describe('success', () => {
        const UPDATED_READING_LIST: ReadingList = {
          ...READING_LIST,
          name: READING_LIST.name.substr(1)
        };

        beforeEach(() => {
          store.dispatch(
            new ReadingListSaved({ readingList: UPDATED_READING_LIST })
          );
        });

        it('provides updates on saving', () => {
          adaptor.savingList$.subscribe(response =>
            expect(response).toBeFalsy()
          );
        });

        it('provides updates on editing', () => {
          adaptor.editingList$.subscribe(response =>
            expect(response).toBeFalsy()
          );
        });

        it('provides updates on the reading list', () => {
          adaptor.current$.subscribe(response =>
            expect(response).toEqual(UPDATED_READING_LIST)
          );
        });
      });

      describe('failure', () => {
        beforeEach(() => {
          store.dispatch(new ReadingListSaveFailed());
        });

        it('provides updates on saving', () => {
          adaptor.savingList$.subscribe(response =>
            expect(response).toBeFalsy()
          );
        });
      });
    });
  });

  describe('adding comics to a readinglist', () => {
    beforeEach(() => {
      adaptor.addComicsToList(READING_LIST, COMICS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ReadingListAddComics({ readingList: READING_LIST, comics: COMICS })
      );
    });

    it('provides updates on adding', () => {
      adaptor.addingComics$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    it('provides updates on the added status', () => {
      adaptor.comicsAdded$.subscribe(response => expect(response).toBeFalsy());
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ReadingListComicsAdded());
      });

      it('provides updates on adding', () => {
        adaptor.addingComics$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });

      it('provides updates on the added status', () => {
        adaptor.comicsAdded$.subscribe(response =>
          expect(response).toBeTruthy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ReadingListAddComicsFailed());
      });

      it('provides updates on adding', () => {
        adaptor.addingComics$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('toggling the selection list dialog', () => {
    describe('toggling it on', () => {
      beforeEach(() => {
        adaptor.showSelectDialog();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ReadingListToggleSelectDialog({ show: true })
        );
      });

      it('provides updates on showing the selection dialog', () => {
        adaptor.showSelectionDialog$.subscribe(response =>
          expect(response).toBeTruthy()
        );
      });
    });

    describe('toggling it off', () => {
      beforeEach(() => {
        adaptor.hideSelectDialog();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          new ReadingListToggleSelectDialog({ show: false })
        );
      });

      it('provides updates on showing the selection dialog', () => {
        adaptor.showSelectionDialog$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('removing comics from a reading list', () => {
    beforeEach(() => {
      adaptor.removeComics(READING_LIST, COMICS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new ReadingListRemoveComics({
          readingList: READING_LIST,
          comics: COMICS
        })
      );
    });

    it('provides updates on removing comics', () => {
      adaptor.removingComics$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new ReadingListComicsRemoved());
      });

      it('provides updates on removing comics', () => {
        adaptor.removingComics$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ReadingListRemoveComicsFailed());
      });

      it('provides updates on removing comics', () => {
        adaptor.removingComics$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
