/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScrapingPageComponent } from './scraping-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectedComicsComponent } from '@app/library/components/selected-comics/selected-comics.component';
import { ComicEditComponent } from '@app/comic-books/components/comic-edit/comic-edit.component';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  initialState as initialScrapingState,
  METADATA_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata.reducer';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/metadata.actions';
import { TitleService } from '@app/core/services/title.service';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  initialState as initialLibrarySelectionState,
  LIBRARY_SELECTIONS_FEATURE_KEY
} from '@app/library/reducers/library-selections.reducer';

describe('ScrapingPageComponent', () => {
  const USER = USER_READER;
  const COMIC = COMIC_BOOK_2;
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: { ...initialLibraryState },
    [LIBRARY_SELECTIONS_FEATURE_KEY]: { ...initialLibrarySelectionState },
    [COMIC_BOOK_LIST_FEATURE_KEY]: {
      ...initialComicBookListState,
      comicBooks: COMIC_BOOKS
    },
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [METADATA_FEATURE_KEY]: { ...initialScrapingState }
  };

  let component: ScrapingPageComponent;
  let fixture: ComponentFixture<ScrapingPageComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let store: MockStore<any>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ScrapingPageComponent,
          SelectedComicsComponent,
          ComicEditComponent
        ],
        imports: [
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule,
          MatFormFieldModule,
          MatToolbarModule,
          MatIconModule,
          MatSelectModule
        ],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(ScrapingPageComponent);
      component = fixture.componentInstance;
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language used is changed', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('reloads the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when the comic is changed', () => {
    beforeEach(() => {
      component.currentComic = null;
      component.onSelectionChanged(COMIC);
    });

    it('sets the current comic', () => {
      expect(component.currentComic).toEqual(COMIC);
    });
  });

  describe('when scraping starts', () => {
    beforeEach(() => {
      component.metadataSource = METADATA_SOURCE;
      component.onScrape({
        series: COMIC.series,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE,
        issueNumber: COMIC.issueNumber,
        volume: COMIC.volume
      });
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadVolumeMetadata({
          metadataSource: METADATA_SOURCE,
          series: COMIC.series,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });
  });
});
