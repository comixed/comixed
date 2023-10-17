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
import { TitleService } from '@app/core/services/title.service';
import { MetadataProcessStatusComponent } from '@app/comic-metadata/components/metadata-process-status/metadata-process-status.component';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { SHOW_COMIC_COVERS_PREFERENCE } from '@app/library/library.constants';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_PREFERENCE } from '@app/core';
import { ComicDetailListViewComponent } from '@app/comic-books/components/comic-detail-list-view/comic-detail-list-view.component';
import { MetadataProcessToolbarComponent } from '@app/comic-metadata/components/metadata-process-toolbar/metadata-process-toolbar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  initialState as initialLoadComicDetailsState
} from '@app/comic-books/reducers/comic-details-list.reducer';

describe('MetadataProcessPageComponent', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];
  const IDS = COMIC_BOOKS.map(comic => comic.id);
  const initialState = {
    [COMIC_DETAILS_LIST_FEATURE_KEY]: initialLoadComicDetailsState,
    [USER_FEATURE_KEY]: initialUserState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState
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
        MetadataProcessStatusComponent,
        MetadataProcessToolbarComponent,
        ComicDetailListViewComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule,
        MatTableModule,
        MatSortModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule
      ],
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
        [COMIC_BOOK_LIST_FEATURE_KEY]: {
          ...initialComicBookListState,
          comicBooks: COMIC_BOOKS
        },
        [COMIC_BOOK_SELECTION_FEATURE_KEY]: {
          ...initialComicBookSelectionState,
          ids: IDS
        }
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
