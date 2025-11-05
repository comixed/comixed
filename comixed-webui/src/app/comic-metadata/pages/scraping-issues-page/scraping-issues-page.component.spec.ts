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
import { ScrapingIssuesPageComponent } from './scraping-issues-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectedComicsComponent } from '@app/library/components/selected-comics/selected-comics.component';
import { ComicScrapingComponent } from '@app/comic-books/components/comic-scraping/comic-scraping.component';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  initialState as initialScrapingState,
  SINGLE_BOOK_SCRAPING_FEATURE_KEY
} from '@app/comic-metadata/reducers/single-book-scraping.reducer';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {
  COMIC_BOOK_3,
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { loadVolumeMetadata } from '@app/comic-metadata/actions/single-book-scraping.actions';
import { TitleService } from '@app/core/services/title.service';
import {
  METADATA_SOURCE_1,
  SCRAPING_VOLUME_1
} from '@app/comic-metadata/comic-metadata.fixtures';
import {
  COMIC_BOOK_FEATURE_KEY,
  initialState as initialComicBookState
} from '@app/comic-books/reducers/comic-book.reducer';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import {
  initialState as initialMultiBookScrapingState,
  MULTI_BOOK_SCRAPING_FEATURE_KEY
} from '@app/comic-metadata/reducers/multi-book-scraping.reducer';
import {
  multiBookScrapingRemoveBook,
  multiBookScrapingSetCurrentBook
} from '@app/comic-metadata/actions/multi-book-scraping.actions';
import { RouterModule } from '@angular/router';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { BehaviorSubject } from 'rxjs';

describe('ScrapingIssuesPageComponent', () => {
  const USER = USER_READER;
  const DISPLAYABLE_COMIC = DISPLAYABLE_COMIC_3;
  const COMIC_BOOK = COMIC_BOOK_3;
  const COMIC_BOOKS = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const MATCH_PUBLISHER = Math.random() > 0.5;
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const PAGE_SIZE = 25;
  const PAGE_NUMBER = 3;
  const initialState = {
    [LIBRARY_FEATURE_KEY]: { ...initialLibraryState },
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [SINGLE_BOOK_SCRAPING_FEATURE_KEY]: { ...initialScrapingState },
    [COMIC_BOOK_FEATURE_KEY]: { ...initialComicBookState },
    [MULTI_BOOK_SCRAPING_FEATURE_KEY]: {
      ...initialMultiBookScrapingState,
      comicBooks: COMIC_BOOKS
    },
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState
  };

  let component: ScrapingIssuesPageComponent;
  let fixture: ComponentFixture<ScrapingIssuesPageComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let store: MockStore<any>;
  let queryParameterService: jasmine.SpyObj<QueryParameterService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([{ path: '**', redirectTo: '' }]),
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatIconModule,
        MatSelectModule,
        ScrapingIssuesPageComponent,
        SelectedComicsComponent,
        ComicScrapingComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: QueryParameterService,
          useValue: {
            pageSize$: new BehaviorSubject(PAGE_SIZE),
            pageIndex$: new BehaviorSubject(PAGE_NUMBER)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapingIssuesPageComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    queryParameterService = TestBed.inject(
      QueryParameterService
    ) as jasmine.SpyObj<QueryParameterService>;
    fixture.detectChanges();
  }));

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
      component.currentComicBook = null;
      component.onSelectionChanged(DISPLAYABLE_COMIC);
    });

    it('updates the current comic', () => {
      expect(component.currentComicBook).toBe(DISPLAYABLE_COMIC);
    });
  });

  describe('when scraping starts', () => {
    beforeEach(() => {
      component.metadataSource = METADATA_SOURCE;
      component.onScrape({
        metadataSource: METADATA_SOURCE,
        publisher: DISPLAYABLE_COMIC.publisher,
        series: DISPLAYABLE_COMIC.series,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE,
        matchPublisher: MATCH_PUBLISHER,
        issueNumber: DISPLAYABLE_COMIC.issueNumber,
        volume: DISPLAYABLE_COMIC.volume
      });
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadVolumeMetadata({
          metadataSource: METADATA_SOURCE,
          publisher: DISPLAYABLE_COMIC.publisher,
          series: DISPLAYABLE_COMIC.series,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE,
          matchPublisher: MATCH_PUBLISHER
        })
      );
    });
  });

  describe('showing the cover of different comic in a popup', () => {
    beforeEach(() => {
      component.showPopup = false;
      component.popupComic;
      component.onShowPopup(true, DISPLAYABLE_COMIC);
    });

    it('sets the comic to show', () => {
      expect(component.popupComic).toBe(DISPLAYABLE_COMIC);
    });

    it('shows the popup', () => {
      expect(component.showPopup).toBeTrue();
    });
  });

  describe('removing a comic book from the queue', () => {
    beforeEach(() => {
      component.onRemoveComicBook(DISPLAYABLE_COMIC);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        multiBookScrapingRemoveBook({
          comicBook: DISPLAYABLE_COMIC,
          pageSize: PAGE_SIZE
        })
      );
    });
  });

  describe('selecting a different comic book from the queue', () => {
    beforeEach(() => {
      component.onSelectComicBook(DISPLAYABLE_COMIC);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        multiBookScrapingSetCurrentBook({ comicBook: DISPLAYABLE_COMIC })
      );
    });
  });

  describe('when the multibook current comic is changed', () => {
    beforeEach(() => {
      component.scrapingVolumes = [SCRAPING_VOLUME_1];
      component.currentVolume = SCRAPING_VOLUME_1.id;
      store.setState({
        ...initialState,
        [MULTI_BOOK_SCRAPING_FEATURE_KEY]: {
          ...initialState,
          currentComicBook: DISPLAYABLE_COMIC
        }
      });
    });

    it('clears the list of scraping volumes', () => {
      expect(component.scrapingVolumes).toEqual([]);
    });

    it('clears the current volume', () => {
      expect(component.currentVolume).toBeNull();
    });
  });
});
