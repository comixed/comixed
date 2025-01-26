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
import { CollectionListComponent } from './collection-list.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CollectionEntry } from '@app/collections/models/collection-entry';
import {
  COLLECTION_LIST_FEATURE_KEY,
  initialState as initialCollectionListState
} from '@app/collections/reducers/collection-list.reducer';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import { QUERY_PARAM_FILTER_TEXT } from '@app/core';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

describe('CollectionListComponent', () => {
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_5
  ];
  const SEARCH_TEXT = 'The filtering text';
  const initialState = {
    [COLLECTION_LIST_FEATURE_KEY]: initialCollectionListState,
    [COMIC_LIST_FEATURE_KEY]: {
      ...initialComicListState,
      comics: COMIC_LIST
    }
  };

  let component: CollectionListComponent;
  let fixture: ComponentFixture<CollectionListComponent>;
  let store: MockStore<any>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let titleService: TitleService;
  let translateService: TranslateService;
  let queryParameterService: jasmine.SpyObj<QueryParameterService>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CollectionListComponent],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          FormsModule,
          ReactiveFormsModule,
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatTableModule,
          MatSortModule,
          MatToolbarModule,
          MatPaginatorModule,
          MatFormFieldModule,
          MatInputModule,
          MatIconModule
        ],
        providers: [
          provideMockStore({ initialState }),
          TitleService,
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject<{}>({
                collectionType: 'stories'
              }),
              queryParams: new BehaviorSubject<{}>({})
            }
          },
          {
            provide: QueryParameterService,
            useValue: {
              updateQueryParam: jasmine.createSpy(
                'QueryParameterService.updateQueryParam()'
              ),
              coverYear$: new BehaviorSubject<CoverDateFilter>({
                year: null,
                month: null
              }),
              pageSize$: new BehaviorSubject<number>(10),
              pageIndex$: new BehaviorSubject<number>(3),
              filterText$: new BehaviorSubject<number>(3),
              sortBy$: new BehaviorSubject<string>(null),
              sortDirection$: new BehaviorSubject<string>(null)
            }
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CollectionListComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      activatedRoute = TestBed.inject(ActivatedRoute);
      router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      spyOn(router, 'navigateByUrl');
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      translateService = TestBed.inject(TranslateService);
      queryParameterService = TestBed.inject(
        QueryParameterService
      ) as jasmine.SpyObj<QueryParameterService>;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('loads the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when the collection type is invalid', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: 'invalid'
      });
    });

    it('redirects to the library', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/library');
    });
  });

  describe('when the collection type is received', () => {
    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: 'stories'
      });
    });

    it('sets the collection type', () => {
      expect(component.collectionType).toEqual(ComicTagType.STORY);
    });

    it('sets the routable type name', () => {
      expect(component.routableTypeName).toEqual('stories');
    });

    it('subscribes to comic list updates', () => {
      expect(component.collectionEntrySubscription).not.toBeNull();
    });
  });

  describe('when a collection is selected', () => {
    const COLLECTION_NAME = 'The Collection';

    beforeEach(() => {
      component.collectionType = ComicTagType.PUBLISHER;
      component.routableTypeName = 'publishers';
      component.onShowCollection({
        tagValue: COLLECTION_NAME,
        comicCount: 23
      } as CollectionEntry);
    });

    it('redirects the browser', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/library',
        'collections',
        'publishers',
        COLLECTION_NAME
      ]);
    });
  });

  describe('applying search text', () => {
    beforeEach(() => {
      component.onApplyFilter(SEARCH_TEXT);
    });

    it('updates the filter text', () => {
      expect(queryParameterService.updateQueryParam).toHaveBeenCalledWith([
        {
          name: QUERY_PARAM_FILTER_TEXT,
          value: SEARCH_TEXT
        }
      ]);
    });
  });

  describe('clearing the search text', () => {
    beforeEach(() => {
      component.onApplyFilter('');
    });

    it('updates the filter text', () => {
      expect(queryParameterService.updateQueryParam).toHaveBeenCalledWith([
        {
          name: QUERY_PARAM_FILTER_TEXT,
          value: null
        }
      ]);
    });
  });
});
