/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import {
  COVER_SIZE_QUERY_PARAM,
  LAYOUT_QUERY_PARAM,
  LIBRARY_DISPLAY_COVER_SIZE,
  LIBRARY_DISPLAY_SAME_HEIGHT,
  LIBRARY_DISPLAY_SORT_FIELD,
  LibraryDisplayAdaptor,
  ROWS_QUERY_PARAM,
  SAME_HEIGHT_QUERY_PARAM,
  SORT_QUERY_PARAM
} from 'app/user/adaptors/library-display.adaptor';
import { TestBed } from '@angular/core/testing';
import { AuthenticationAdaptor, User } from 'app/user';
import { StoreModule } from '@ngrx/store';
import { USER_READER } from 'app/user/models/user.fixtures';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { generate_random_string } from '../../../test/testing-utils';
import { BehaviorSubject } from 'rxjs';
import { EffectsModule } from '@ngrx/effects';
import { LoggerModule } from '@angular-ru/logger';

fdescribe('LibraryDisplayAdaptor', () => {
  const USER = { ...USER_READER };

  let libraryDisplayAdaptor: LibraryDisplayAdaptor;
  let authenticationAdaptor: jasmine.SpyObj<AuthenticationAdaptor>;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      providers: [
        LibraryDisplayAdaptor,
        {
          provide: AuthenticationAdaptor,
          useValue: {
            user$: new BehaviorSubject<User>(null),
            setPreference: jasmine.createSpy(
              'AuthenticationAdaptor.setPreference'
            ),
            getPreference: jasmine.createSpy(
              'AuthenticationAdaptor.getPreference'
            )
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: { queryParams: new BehaviorSubject<{}>({}) }
          }
        }
      ]
    });

    libraryDisplayAdaptor = TestBed.get(LibraryDisplayAdaptor);
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    (authenticationAdaptor.user$ as BehaviorSubject<User>).next(USER);
    activatedRoute = TestBed.get(ActivatedRoute);
    router = TestBed.get(Router);
  });

  it('should create an instance', () => {
    expect(libraryDisplayAdaptor).toBeTruthy();
  });

  describe('the library layout parameter', () => {
    const LAYOUT = generate_random_string();

    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        layout: LAYOUT
      });
    });

    it('provides updates', () => {
      libraryDisplayAdaptor.layout$.subscribe(value => {
        expect(value).toEqual(LAYOUT);
      });
    });
  });

  describe('the library sort field parameter', () => {
    const SORT = generate_random_string();

    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        sort: SORT
      });
    });

    it('provides updates', () => {
      libraryDisplayAdaptor.sortField$.subscribe(value => {
        expect(value).toEqual(SORT);
      });
    });
  });

  describe('the library rows parameter', () => {
    const ROWS = Math.floor(Math.random() * 100);

    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        rows: ROWS
      });
    });

    it('provides updates', () => {
      libraryDisplayAdaptor.rows$.subscribe(value => {
        expect(value).toEqual(ROWS);
      });
    });
  });

  describe('the library cover size parameter', () => {
    const COVER_SIZE = Math.floor(Math.random() * 100);

    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        cover_size: COVER_SIZE
      });
    });

    it('provides updates', () => {
      libraryDisplayAdaptor.coverSize$.subscribe(value => {
        expect(value).toEqual(COVER_SIZE);
      });
    });
  });

  describe('the library same height parameter', () => {
    const SAME_HEIGHT = Math.floor(Math.random() * 100) % 2 === 0;

    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        same_height: SAME_HEIGHT ? 'true' : 'false'
      });
    });

    it('provides updates', () => {
      libraryDisplayAdaptor.sameHeight$.subscribe(value => {
        expect(value).toEqual(SAME_HEIGHT);
      });
    });
  });

  describe('setting the layout parameter', () => {
    const LAYOUT = generate_random_string();

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'updateQueryParameters');
      libraryDisplayAdaptor.setLayout(LAYOUT);
    });

    it('can set the layout parameter', () => {
      expect(libraryDisplayAdaptor.updateQueryParameters).toHaveBeenCalledWith(
        LAYOUT_QUERY_PARAM,
        LAYOUT
      );
    });
  });

  describe('setting the sort field parameter', () => {
    const SORT_FIELD = generate_random_string();

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'updateQueryParameters');
    });

    describe('with save', () => {
      beforeEach(() => {
        libraryDisplayAdaptor.setSortField(SORT_FIELD, true);
      });

      it('updates the url', () => {
        expect(
          libraryDisplayAdaptor.updateQueryParameters
        ).toHaveBeenCalledWith(SORT_QUERY_PARAM, SORT_FIELD);
      });

      it('can save the value', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          LIBRARY_DISPLAY_SORT_FIELD,
          SORT_FIELD
        );
      });
    });

    describe('without save', () => {
      beforeEach(() => {
        libraryDisplayAdaptor.setSortField(SORT_FIELD, false);
      });

      it('updates the url', () => {
        expect(
          libraryDisplayAdaptor.updateQueryParameters
        ).toHaveBeenCalledWith(SORT_QUERY_PARAM, SORT_FIELD);
      });

      it('does not save the value', () => {
        expect(authenticationAdaptor.setPreference).not.toHaveBeenCalled();
      });
    });
  });

  describe('setting the display rows parameter', () => {
    const ROWS = Math.floor(Math.random() * 100);

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'updateQueryParameters');
      libraryDisplayAdaptor.setDisplayRows(ROWS);
    });

    it('can set the layout parameter', () => {
      expect(libraryDisplayAdaptor.updateQueryParameters).toHaveBeenCalledWith(
        ROWS_QUERY_PARAM,
        `${ROWS}`
      );
    });
  });

  describe('setting the same height parameter', () => {
    const SAME_HEIGHT = Math.floor(Math.random() * 100) % 2 === 0;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'updateQueryParameters');
      libraryDisplayAdaptor.setSameHeight(SAME_HEIGHT);
    });

    it('updates the url', () => {
      expect(libraryDisplayAdaptor.updateQueryParameters).toHaveBeenCalledWith(
        SAME_HEIGHT_QUERY_PARAM,
        SAME_HEIGHT ? '1' : '0'
      );
    });

    it('can save the value', () => {
      expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_SAME_HEIGHT,
        SAME_HEIGHT ? '1' : '0'
      );
    });
  });

  describe('setting the cover size parameter', () => {
    const COVER_SIZE = Math.floor(Math.random() * 100);

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'updateQueryParameters');
    });

    describe('with save', () => {
      beforeEach(() => {
        libraryDisplayAdaptor.setCoverSize(COVER_SIZE, true);
      });

      it('updates the url', () => {
        expect(
          libraryDisplayAdaptor.updateQueryParameters
        ).toHaveBeenCalledWith(COVER_SIZE_QUERY_PARAM, `${COVER_SIZE}`);
      });

      it('can save the value', () => {
        expect(authenticationAdaptor.setPreference).toHaveBeenCalledWith(
          LIBRARY_DISPLAY_COVER_SIZE,
          `${COVER_SIZE}`
        );
      });
    });

    describe('without save', () => {
      beforeEach(() => {
        libraryDisplayAdaptor.setCoverSize(COVER_SIZE, false);
      });

      it('updates the url', () => {
        expect(
          libraryDisplayAdaptor.updateQueryParameters
        ).toHaveBeenCalledWith(COVER_SIZE_QUERY_PARAM, `${COVER_SIZE}`);
      });

      it('does not save the value', () => {
        expect(authenticationAdaptor.setPreference).not.toHaveBeenCalled();
      });
    });
  });

  describe('updating the query parameters', () => {
    const PARAM_NAME = generate_random_string();
    const PARAM_VALUE = generate_random_string();

    it('routes to the new url', () => {
      spyOn(router, 'navigate').and.callFake((ignored, parameters) => {
        expect(parameters.queryParams[PARAM_NAME]).toEqual(PARAM_VALUE);
      });
      libraryDisplayAdaptor.updateQueryParameters(PARAM_NAME, PARAM_VALUE);
    });
  });
});
