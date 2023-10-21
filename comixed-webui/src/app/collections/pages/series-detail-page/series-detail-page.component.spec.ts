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
import { SeriesDetailPageComponent } from './series-detail-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  initialState as initialSeriesState,
  SERIES_FEATURE_KEY
} from '@app/collections/reducers/series.reducer';
import { initialState as initialComicBookListState } from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TitleService } from '@app/core/services/title.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ISSUE_1 } from '@app/collections/collections.fixtures';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { SeriesDetailNamePipe } from '@app/collections/pipes/series-detail-name.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  initialState as initialComicDetailsListState
} from '@app/comic-books/reducers/comic-details-list.reducer';

describe('SeriesDetailPageComponent', () => {
  const PUBLISHER = 'The Publisher';
  const SERIES = 'The Series';
  const VOLUME = '2022';
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const COMIC_BOOK = COMIC_DETAIL_1;
  const ISSUE = {
    ...ISSUE_1,
    publisher: COMIC_BOOK.publisher,
    series: COMIC_BOOK.series,
    volume: COMIC_BOOK.volume,
    issue: COMIC_BOOK.issueNumber
  };
  const initialState = {
    [SERIES_FEATURE_KEY]: initialSeriesState,
    [COMIC_DETAILS_LIST_FEATURE_KEY]: initialComicDetailsListState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: SeriesDetailPageComponent;
  let fixture: ComponentFixture<SeriesDetailPageComponent>;
  let titleService: TitleService;
  let translateService: TranslateService;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeriesDetailPageComponent, SeriesDetailNamePipe],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({
              publisher: PUBLISHER,
              name: SERIES,
              volume: VOLUME
            }),
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: {} as ActivatedRouteSnapshot
          }
        },
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesDetailPageComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(TitleService);
    translateService = TestBed.inject(TranslateService);
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('parameters', () => {
    it('loads the publisher name', () => {
      expect(component.publisher).toEqual(PUBLISHER);
    });

    it('loads the series name', () => {
      expect(component.name).toEqual(SERIES);
    });

    it('loads the volume', () => {
      expect(component.volume).toEqual(VOLUME);
    });
  });

  describe('language change', () => {
    beforeEach(() => {
      spyOn(titleService, 'setTitle');
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('sorting', () => {
    it('can sort by issue number', () => {
      expect(
        component.dataSource.sortingDataAccessor(ISSUE, 'issue-number')
      ).toEqual(ISSUE.issueNumber);
    });

    it('can sort by cover date', () => {
      expect(
        component.dataSource.sortingDataAccessor(ISSUE, 'cover-date')
      ).toEqual(ISSUE.coverDate);
    });

    it('can sort by store date', () => {
      expect(
        component.dataSource.sortingDataAccessor(ISSUE, 'store-date')
      ).toEqual(ISSUE.storeDate);
    });

    it('can sort by the found state', () => {
      expect(
        component.dataSource.sortingDataAccessor(ISSUE, 'in-library')
      ).toEqual(`${ISSUE.found}`);
    });

    it('ignores unknown fields', () => {
      expect(
        component.dataSource.sortingDataAccessor(ISSUE, 'in-between')
      ).toEqual('');
    });
  });

  describe('getting the id for an issue', () => {
    beforeEach(() => {
      component.comicBooks = COMIC_DETAILS;
    });

    it('returns a value when the issue is found', () => {
      expect(component.getComicBookIdForRow(ISSUE)).toEqual(COMIC_BOOK.comicId);
    });

    it('returns a null when the issue is not found', () => {
      expect(
        component.getComicBookIdForRow({
          ...ISSUE,
          publisher: COMIC_BOOK.publisher.substr(1)
        })
      ).toBeUndefined();
    });
  });

  describe('the series percentage complete', () => {
    beforeEach(() => {
      component.percentageComplete = 0;
      component.inLibrary = 0;
      component.totalIssues = 0;
      store.setState({
        ...initialState,
        [SERIES_FEATURE_KEY]: { ...initialSeriesState, detail: [ISSUE] },
        [COMIC_DETAILS_LIST_FEATURE_KEY]: {
          ...initialComicBookListState,
          comicBooks: COMIC_DETAILS,
          filteredCount: COMIC_DETAILS.length
        }
      });
    });

    it('sets the total in library', () => {
      expect(component.inLibrary).not.toEqual(0);
    });

    it('sets the total issues', () => {
      expect(component.inLibrary).not.toEqual(0);
    });

    it('sets the percentage', () => {
      expect(component.percentageComplete).not.toEqual(0);
    });
  });
});
