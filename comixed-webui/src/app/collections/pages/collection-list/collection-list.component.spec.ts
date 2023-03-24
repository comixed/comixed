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
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { CollectionListEntry } from '@app/collections/models/collection-list-entry';
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

describe('CollectionListComponent', () => {
  const COMICS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const initialState = {
    [COMIC_BOOK_LIST_FEATURE_KEY]: {
      ...initialComicBookListState,
      comicBooks: COMICS
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
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatTableModule,
          MatSortModule,
          MatToolbarModule,
          MatPaginatorModule,
          MatFormFieldModule,
          MatInputModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject<{}>({})
            }
          },
          TitleService,
          {
            provide: QueryParameterService,
            useValue: {}
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
      expect(component.collectionType).toEqual(CollectionType.STORIES);
    });

    it('sets the routable type name', () => {
      expect(component.routableTypeName).toEqual('stories');
    });

    it('subscribes to comic list updates', () => {
      expect(component.collectionSubscription).not.toBeNull();
    });
  });

  describe('when a collection is selected', () => {
    const COLLECTION_NAME = 'The Collection';

    describe('when it is  series', () => {
      const VOLUME = '2022';

      beforeEach(() => {
        component.collectionType = CollectionType.SERIES;
        component.routableTypeName = 'series';
        component.onShowCollection({
          name: `${COLLECTION_NAME} v${VOLUME}`,
          comicCount: 23
        } as CollectionListEntry);
      });

      it('redirects the browser', () => {
        expect(router.navigate).toHaveBeenCalledWith([
          '/library',
          'collections',
          'series',
          COLLECTION_NAME,
          'volumes',
          VOLUME
        ]);
      });
    });

    describe('when it is not a series', () => {
      beforeEach(() => {
        component.collectionType = CollectionType.PUBLISHERS;
        component.routableTypeName = 'publishers';
        component.onShowCollection({
          name: COLLECTION_NAME,
          comicCount: 23
        } as CollectionListEntry);
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
  });

  describe('sorting entries', () => {
    const ENTRY = { name: 'The entry', comicCount: 23 } as CollectionListEntry;

    it('can sort by collection name', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'name')).toEqual(
        ENTRY.name
      );
    });

    it('can sort by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'comic-count')
      ).toEqual(ENTRY.comicCount);
    });
  });
});
