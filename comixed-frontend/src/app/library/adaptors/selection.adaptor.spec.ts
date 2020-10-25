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

import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { COMIC_1, COMIC_2, COMIC_3, COMIC_5 } from 'app/comics/comics.fixtures';
import { LibraryModuleState } from 'app/library';
import { reducer } from 'app/library/reducers/selection.reducer';
import { LoggerModule } from '@angular-ru/logger';
import { SelectionAdaptor } from './selection.adaptor';

describe('SelectionAdaptor', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const COMIC = COMIC_2;

  let adaptor: SelectionAdaptor;
  let store: Store<LibraryModuleState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ selection_state: reducer }),
        LoggerModule.forRoot()
      ],
      providers: [SelectionAdaptor]
    });

    adaptor = TestBed.get(SelectionAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(adaptor).toBeTruthy();
  });

  describe('selecting a group of comics', () => {
    beforeEach(() => {
      adaptor.selectComics(COMICS);
    });

    it('provides updates', () => {
      adaptor.comicSelection$.subscribe(response =>
        expect(response).toEqual(COMICS)
      );
    });

    describe('deselecting a group of comics', () => {
      const REMOVED_COMIC = COMICS[0];

      beforeEach(() => {
        adaptor.deselectComics([REMOVED_COMIC]);
      });

      it('provides updates', () => {
        adaptor.comicSelection$.subscribe(response =>
          expect(response).not.toContain(REMOVED_COMIC)
        );
      });
    });
  });

  describe('selecting a single comic', () => {
    beforeEach(() => {
      adaptor.selectComic(COMIC);
    });

    it('provides updates', () => {
      adaptor.comicSelection$.subscribe(response =>
        expect(response).toContain(COMIC)
      );
    });

    describe('removing a single comic', () => {
      beforeEach(() => {
        adaptor.deselectComic(COMIC);
      });

      it('provides updates', () => {
        adaptor.comicSelection$.subscribe(response =>
          expect(response).not.toContain(COMIC)
        );
      });
    });
  });

  describe('clearing selections', () => {
    beforeEach(() => {
      adaptor.selectComics(COMICS);
      adaptor.clearComicSelections();
    });

    it('provides updates', () => {
      adaptor.comicSelection$.subscribe(response =>
        expect(response).toEqual([])
      );
    });
  });
});
