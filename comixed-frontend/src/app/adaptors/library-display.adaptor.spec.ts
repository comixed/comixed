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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  LIBRARY_DISPLAY_COVER_SIZE,
  LIBRARY_DISPLAY_COVER_SIZE_DEFAULT,
  LIBRARY_DISPLAY_LAYOUT,
  LIBRARY_DISPLAY_LAYOUT_DEFAULT,
  LIBRARY_DISPLAY_ROWS,
  LIBRARY_DISPLAY_ROWS_DEFAULT,
  LIBRARY_DISPLAY_SAME_HEIGHT,
  LIBRARY_DISPLAY_SORT_FIELD,
  LIBRARY_DISPLAY_SORT_FIELD_DEFAULT,
  LibraryDisplayAdaptor
} from 'app/adaptors/library-display.adaptor';
import { TestBed } from '@angular/core/testing';
import { AuthenticationAdaptor } from 'app/user';
import { StoreModule } from '@ngrx/store';
import { REDUCERS } from 'app/app.reducers';
import { USER_READER } from 'app/user/models/user.fixtures';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { generate_random_string } from '../../test/testing-utils';
import { BehaviorSubject, of } from 'rxjs';
import { User } from 'app/user';

describe('LibraryDisplayAdaptor', () => {
  const USER = { ...USER_READER };

  let display_adaptor: LibraryDisplayAdaptor;
  let auth_adaptor: jasmine.SpyObj<AuthenticationAdaptor>;
  let activated_route: ActivatedRoute;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, StoreModule.forRoot(REDUCERS)],
      providers: [
        LibraryDisplayAdaptor,
        {
          provide: AuthenticationAdaptor,
          useValue: {
            user$: new BehaviorSubject<User>(null),
            set_preference: jasmine.createSpy(
              'AuthenticationAdaptor.set_preference'
            ),
            get_preference: jasmine.createSpy(
              'AuthenticationAdaptor.get_preference'
            )
          }
        }
      ]
    });

    display_adaptor = TestBed.get(LibraryDisplayAdaptor);
    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    (auth_adaptor.user$ as BehaviorSubject<User>).next(USER);
    activated_route = TestBed.get(ActivatedRoute);
    router = TestBed.get(Router);
  });

  it('should create an instance', () => {
    expect(display_adaptor).toBeTruthy();
  });

  it('sends updates on the layout', () => {
    const layout = generate_random_string();
    display_adaptor._layout$.next(layout);
    display_adaptor.layout$.subscribe(value => {
      expect(value).toEqual(layout);
    });
  });

  it('sends updates on the sort field', () => {
    const sort = generate_random_string();
    display_adaptor._sort_field$.next(sort);
    display_adaptor.sort_field$.subscribe(value => {
      expect(value).toEqual(sort);
    });
  });

  it('sends updates on rows', () => {
    const rows = Math.random();
    display_adaptor._rows$.next(rows);
    display_adaptor.rows$.subscribe(value => {
      expect(value).toEqual(rows);
    });
  });

  it('sends updates on same height settings as true', () => {
    display_adaptor._same_height$.next(true);
    display_adaptor.same_height$.subscribe(value => {
      expect(value).toBeTruthy();
    });
  });

  it('sends updates on same height settings as false', () => {
    display_adaptor._same_height$.next(false);
    display_adaptor.same_height$.subscribe(value => {
      expect(value).toBeFalsy();
    });
  });

  it('sends updates on cover size', () => {
    const size = Math.random();
    display_adaptor._cover_size$.next(size);
    display_adaptor.cover_size$.subscribe(value => {
      expect(value).toEqual(size);
    });
  });

  describe('the layout', () => {
    const LAYOUT = 'list';

    it('returns a reasonable default value', () => {
      auth_adaptor.get_preference.and.returnValue(null);
      expect(display_adaptor.get_layout()).toEqual(
        LIBRARY_DISPLAY_LAYOUT_DEFAULT
      );
      expect(auth_adaptor.get_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_LAYOUT
      );
    });

    it('gets the right value', () => {
      auth_adaptor.get_preference.and.returnValue(LAYOUT);
      expect(display_adaptor.get_layout()).toEqual(LAYOUT);
    });

    it('sets the value', () => {
      display_adaptor.set_layout(LAYOUT);
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_LAYOUT,
        LAYOUT
      );
    });
  });

  describe('the sort field', () => {
    const SORT_FIELD = 'sortable_issue_number';

    it('returns a reasonable default value', () => {
      auth_adaptor.get_preference.and.returnValue(null);
      expect(display_adaptor.get_sort_field()).toEqual(
        LIBRARY_DISPLAY_SORT_FIELD_DEFAULT
      );
    });

    it('gets the right value', () => {
      auth_adaptor.get_preference.and.returnValue(SORT_FIELD);
      expect(display_adaptor.get_sort_field()).toEqual(SORT_FIELD);
    });

    it('sets the value', () => {
      display_adaptor.set_sort_field(SORT_FIELD);
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_SORT_FIELD,
        SORT_FIELD
      );
    });

    it('sets the value without saving', () => {
      display_adaptor.set_sort_field(SORT_FIELD, false);
      expect(auth_adaptor.set_preference).not.toHaveBeenCalledWith(
        LIBRARY_DISPLAY_SORT_FIELD,
        SORT_FIELD
      );
    });
  });

  describe('the rows value', () => {
    const ROWS = 17;

    it('returns a reasonable default value', () => {
      auth_adaptor.get_preference.and.returnValue(null);
      expect(display_adaptor.get_display_rows()).toEqual(
        LIBRARY_DISPLAY_ROWS_DEFAULT
      );
    });

    it('gets the right value', () => {
      auth_adaptor.get_preference.and.returnValue(`${ROWS}`);
      expect(display_adaptor.get_display_rows()).toEqual(ROWS);
    });

    it('sets the value', () => {
      display_adaptor.set_display_rows(ROWS);
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_ROWS,
        `${ROWS}`
      );
    });
  });

  describe('the same height flag', () => {
    it('returns a reasonable default value', () => {
      auth_adaptor.get_preference.and.returnValue(null);
      expect(display_adaptor.get_same_height()).toEqual(
        parseInt(LIBRARY_DISPLAY_SAME_HEIGHT, 0) === 1 ? true : false
      );
    });

    it('gets the right value when true was saved', () => {
      auth_adaptor.get_preference.and.returnValue('1');
      expect(display_adaptor.get_same_height()).toEqual(true);
    });

    it('gets the right value when false was saved', () => {
      auth_adaptor.get_preference.and.returnValue('0');
      expect(display_adaptor.get_same_height()).toEqual(false);
    });

    it('sets the value when true', () => {
      display_adaptor.set_same_height(true);
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_SAME_HEIGHT,
        '1'
      );
    });

    it('sets the value when false', () => {
      display_adaptor.set_same_height(false);
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_SAME_HEIGHT,
        '0'
      );
    });
  });

  describe('the cover size', () => {
    const COVER_SIZE = 217;

    it('returns a reasonable default value', () => {
      auth_adaptor.get_preference.and.returnValue(null);
      expect(display_adaptor.get_cover_size()).toEqual(
        LIBRARY_DISPLAY_COVER_SIZE_DEFAULT
      );
    });

    it('gets the right value', () => {
      auth_adaptor.get_preference.and.returnValue(`${COVER_SIZE}`);
      expect(display_adaptor.get_cover_size()).toEqual(COVER_SIZE);
    });

    it('sets the value', () => {
      display_adaptor.set_cover_size(COVER_SIZE);
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        LIBRARY_DISPLAY_COVER_SIZE,
        `${COVER_SIZE}`
      );
    });

    it('sets the value without saving', () => {
      display_adaptor.set_cover_size(COVER_SIZE, false);
      expect(auth_adaptor.set_preference).not.toHaveBeenCalled();
    });
  });
});
