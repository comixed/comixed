/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LibraryGroupComponent } from './library-group.component';
import { LoggerModule } from '@angular-ru/logger';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ComicCoversComponent } from '@app/library/components/comic-covers/comic-covers.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationPaneComponent } from '@app/library/components/navigation-pane/navigation-pane.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AlertService } from '@app/core';
import {
  CHARACTERS_GROUP,
  LOCATIONS_GROUP,
  PUBLISHERS_GROUP,
  SERIES_GROUP,
  STORIES_GROUP,
  TEAMS_GROUP
} from '@app/library/library.constants';
import { Comic } from '@app/library';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('LibraryGroupComponent', () => {
  const initialState = {
    [LIBRARY_FEATURE_KEY]: initialLibraryState,
    [DISPLAY_FEATURE_KEY]: initialDisplayState
  };

  let component: LibraryGroupComponent;
  let fixture: ComponentFixture<LibraryGroupComponent>;
  let store: MockStore<any>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let alertService: AlertService;
  let existingSubscription: jasmine.SpyObj<Subscription>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LibraryGroupComponent,
        ComicCoversComponent,
        LibraryToolbarComponent,
        NavigationPaneComponent
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatTreeModule,
        MatBadgeModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatFormFieldModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject<{}>({})
          }
        },
        {
          provide: Subscription,
          useValue: {
            unsubscribe: jasmine.createSpy('Subscription.unsubscribe()')
          }
        },
        AlertService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryGroupComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
    existingSubscription = TestBed.inject(Subscription) as jasmine.SpyObj<
      Subscription
    >;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('processing the group type', () => {
    const COMICS = [
      {
        publisher: 'publisher1',
        series: 'series1',
        characters: ['character1'],
        teams: ['team1'],
        locations: ['location1'],
        storyArcs: ['story1']
      },
      {
        publisher: 'publisher2',
        series: 'series2',
        characters: ['character2'],
        teams: ['team2'],
        locations: ['location2'],
        storyArcs: ['story2']
      },
      {
        publisher: null,
        series: null,
        characters: [],
        teams: [],
        locations: [],
        storyArcs: []
      }
    ] as Comic[];

    beforeEach(() => {
      store.setState({
        ...initialState,
        [LIBRARY_FEATURE_KEY]: { ...initialLibraryState, comics: COMICS }
      });
    });

    describe('when it is invalid', () => {
      beforeEach(() => {
        (activatedRoute.params as BehaviorSubject<{}>).next({
          groupType: 'invalid',
          groupName: 'some name'
        });
      });

      it('notifies the user', () => {
        expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
      });

      it('sends the user to the library page', () => {
        expect(router.navigate).toHaveBeenCalledWith(['/library']);
      });
    });

    describe('when it is by publisher', () => {
      beforeEach(() => {
        component.comics = [];
        component.comicSubscription = existingSubscription;
        (activatedRoute.params as BehaviorSubject<{}>).next({
          type: PUBLISHERS_GROUP,
          name: COMICS[0].publisher
        });
      });

      it('unsubscribes from any existing subscription', () => {
        expect(existingSubscription.unsubscribe).toHaveBeenCalled();
      });

      it('subscribes to updates', () => {
        expect(component.comics).toEqual([COMICS[0]]);
      });
    });

    describe('when it is by series', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          type: SERIES_GROUP,
          name: COMICS[0].series
        });
      });

      it('subscribes to updates', () => {
        expect(component.comics).toEqual([COMICS[0]]);
      });
    });

    describe('when it is by characters', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          type: CHARACTERS_GROUP,
          name: COMICS[0].characters[0]
        });
      });

      it('subscribes to updates', () => {
        expect(component.comics).toEqual([COMICS[0]]);
      });
    });

    describe('when it is by teams', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          type: TEAMS_GROUP,
          name: COMICS[0].teams[0]
        });
      });

      it('subscribes to updates', () => {
        expect(component.comics).toEqual([COMICS[0]]);
      });
    });

    describe('when it is by location', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          type: LOCATIONS_GROUP,
          name: COMICS[0].locations[0]
        });
      });

      it('subscribes to updates', () => {
        expect(component.comics).toEqual([COMICS[0]]);
      });
    });

    describe('when it is by story', () => {
      beforeEach(() => {
        component.comics = [];
        (activatedRoute.params as BehaviorSubject<{}>).next({
          type: STORIES_GROUP,
          name: COMICS[0].storyArcs[0]
        });
      });

      it('subscribes to updates', () => {
        expect(component.comics).toEqual([COMICS[0]]);
      });
    });
  });
});
