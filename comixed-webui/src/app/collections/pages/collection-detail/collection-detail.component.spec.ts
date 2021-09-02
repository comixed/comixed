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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionDetailComponent } from './collection-detail.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ComicCoversComponent } from '@app/library/components/comic-covers/comic-covers.component';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { CollectionType } from '@app/collections/models/comic-collection.enum';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-book/reducers/comic-list.reducer';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from '@app/comic-book/comic-book.fixtures';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {
  READING_LISTS_FEATURE_KEY,
  reducer as initialReadingListsState
} from '@app/lists/reducers/reading-lists.reducer';
import { MatDividerModule } from '@angular/material/divider';

describe('CollectionDetailComponent', () => {
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4, COMIC_5];
  const initialState = {
    [COMIC_LIST_FEATURE_KEY]: { ...initialComicListState, comics: COMICS },
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [DISPLAY_FEATURE_KEY]: initialDisplayState,
    [READING_LISTS_FEATURE_KEY]: initialReadingListsState
  };

  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  let store: MockStore<any>;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CollectionDetailComponent,
        ComicCoversComponent,
        LibraryToolbarComponent
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatMenuModule,
        MatIconModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatToolbarModule,
        MatSelectModule,
        MatOptionModule,
        MatDividerModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({
              collectionType: CollectionType.CHARACTERS,
              collectionName: 'Batman'
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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

  describe('when the collection details are received', () => {
    const COLLECTION_TYPE = 'stories';
    const COLLECTION_NAME = 'The Collection';

    beforeEach(() => {
      (activatedRoute.params as BehaviorSubject<{}>).next({
        collectionType: COLLECTION_TYPE,
        collectionName: COLLECTION_NAME
      });
    });

    it('sets the collection type', () => {
      expect(component.collectionType).toEqual(CollectionType.STORIES);
    });

    it('sets the routable type name', () => {
      expect(component.routableTypeName).toEqual(COLLECTION_TYPE);
    });

    it('sets the collection name', () => {
      expect(component.collectionName).toEqual(COLLECTION_NAME);
    });

    it('subscribes to comic updates', () => {
      expect(component.comicSubscription).not.toBeNull();
    });

    it('subscribes to selection updates', () => {
      expect(component.selectedSubscription).not.toBeNull();
    });
  });

  describe('show collections', () => {
    describe('when the collection type is publisher', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'publishers',
          collectionName: COMICS[0].publisher
        });
      });

      it('selects comics', () => {
        expect(component.comics).not.toEqual([]);
      });
    });

    describe('when the collection type is series', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'series',
          collectionName: COMICS[0].series
        });
      });

      it('selects comics', () => {
        expect(component.comics).not.toEqual([]);
      });
    });

    describe('when the collection type is characters', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'characters',
          collectionName: COMICS[0].characters[0]
        });
      });

      it('selects comics', () => {
        expect(component.comics).not.toEqual([]);
      });
    });

    describe('when the collection type is teams', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'teams',
          collectionName: COMICS[0].teams[0]
        });
      });

      it('selects comics', () => {
        expect(component.comics).not.toEqual([]);
      });
    });

    describe('when the collection type is locations', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'locations',
          collectionName: COMICS[0].locations[0]
        });
      });

      it('selects comics', () => {
        expect(component.comics).not.toEqual([]);
      });
    });

    describe('when the collection type is stories', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          collectionType: 'stories',
          collectionName: COMICS[0].storyArcs[0]
        });
      });

      it('selects comics', () => {
        expect(component.comics).not.toEqual([]);
      });
    });
  });
});
