/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataProcessPageComponent } from './metadata-process-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialLibrarySelectionsState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';
import { TitleService } from '@app/core/services/title.service';
import { MetadataProcessStatusComponent } from '@app/comic-metadata/components/metadata-process-status/metadata-process-status.component';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_PREFERENCE } from '@app/core';

describe('MetadataProcessPageComponent', () => {
  const IDS = [4, 17, 6];
  const initialState = {
    [LIBRARY_SELECTIONS_FEATURE_KEY]: initialLibrarySelectionsState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: initialComicBookListState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: MetadataProcessPageComponent;
  let fixture: ComponentFixture<MetadataProcessPageComponent>;
  let store: MockStore<any>;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MetadataProcessPageComponent,
        MetadataProcessStatusComponent
      ],
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(MetadataProcessPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selection changes', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [LIBRARY_SELECTIONS_FEATURE_KEY]: { ...initialState, ids: IDS }
      });
    });

    it('updates the list of selected ids', () => {
      expect(component.selectedIds).toEqual(IDS);
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating the displayed comics', () => {
    beforeEach(() => {
      component.selectedIds = [COMIC_BOOK_1.id];
      component.comicBooks = [
        COMIC_BOOK_1,
        COMIC_BOOK_2,
        COMIC_BOOK_3,
        COMIC_BOOK_4,
        COMIC_BOOK_5
      ];
      component.updateDisplayedComicBooks();
    });

    it('only displays the selected comic books', () => {
      expect(component.displayedComicBooks).toEqual([COMIC_BOOK_1]);
    });

    describe('when the selection changes', () => {
      beforeEach(() => {
        store.setState({
          ...initialState,
          [LIBRARY_SELECTIONS_FEATURE_KEY]: {
            ...initialLibrarySelectionsState,
            ids: [COMIC_BOOK_2.id]
          }
        });
      });

      it('updates the displayed comic books', () => {
        expect(component.displayedComicBooks).toEqual([COMIC_BOOK_2]);
      });
    });
  });

  describe('loading user preferences', () => {
    const PAGE_SIZE = 50;
    const SHOW_COVERS = Math.random() > 0.5;

    beforeEach(() => {
      component.pageSize = PAGE_SIZE_DEFAULT;
      component.showCovers = !SHOW_COVERS;
      store.setState({
        ...initialState,
        [USER_FEATURE_KEY]: {
          ...initialUserState,
          user: {
            ...USER_ADMIN,
            preferences: [
              { name: PAGE_SIZE_PREFERENCE, value: `${PAGE_SIZE}` },
              { name: SHOW_COMIC_COVERS_PREFERENCE, value: `${SHOW_COVERS}` }
            ]
          }
        }
      });
    });

    it('sets the page size', () => {
      expect(component.pageSize).toEqual(PAGE_SIZE);
    });

    it('sets the show covers flag', () => {
      expect(component.showCovers).toEqual(SHOW_COVERS);
    });
  });
});
