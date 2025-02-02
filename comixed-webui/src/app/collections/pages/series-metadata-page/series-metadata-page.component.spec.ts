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
import { SeriesMetadataPageComponent } from './series-metadata-page.component';
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
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { SeriesDetailNamePipe } from '@app/collections/pipes/series-detail-name.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';

describe('SeriesMetadataPageComponent', () => {
  const PUBLISHER = 'The Publisher';
  const SERIES = 'The Series';
  const VOLUME = '2022';
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const COMIC_BOOK = DISPLAYABLE_COMIC_1;
  const ISSUE = {
    ...ISSUE_1,
    publisher: COMIC_BOOK.publisher,
    series: COMIC_BOOK.series,
    volume: COMIC_BOOK.volume,
    issue: COMIC_BOOK.issueNumber
  };
  const ISSUES = [ISSUE];
  const initialState = {
    [SERIES_FEATURE_KEY]: initialSeriesState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let component: SeriesMetadataPageComponent;
  let fixture: ComponentFixture<SeriesMetadataPageComponent>;
  let titleService: TitleService;
  let translateService: TranslateService;
  let store: MockStore<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeriesMetadataPageComponent, SeriesDetailNamePipe],
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

    fixture = TestBed.createComponent(SeriesMetadataPageComponent);
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
      component.comics = COMIC_LIST;
    });

    it('returns a value when the issue is found', () => {
      expect(component.getComicBookIdForRow(ISSUE)).toEqual(
        COMIC_BOOK.comicBookId
      );
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
      component.dataSource.data = [ISSUE];
      store.setState({
        ...initialState,
        [COMIC_LIST_FEATURE_KEY]: {
          ...initialComicListState,
          comics: COMIC_LIST,
          filteredCount: COMIC_LIST.length
        },
        [SERIES_FEATURE_KEY]: { ...initialSeriesState, issues: [ISSUE] }
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
