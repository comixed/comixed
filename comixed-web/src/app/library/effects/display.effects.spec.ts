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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { DisplayEffects } from './display.effects';
import { LoggerModule } from '@angular-ru/logger';
import { pageSizeSet, setPageSize } from '@app/library/actions/display.actions';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';
import { hot } from 'jasmine-marbles';

describe('DisplayEffects', () => {
  const PAGE_SIZE = 400;

  let actions$: Observable<any>;
  let effects: DisplayEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [DisplayEffects, provideMockActions(() => actions$)]
    });

    effects = TestBed.inject(DisplayEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('setting the page size', () => {
    it('fires an action on saving the value', () => {
      const action = setPageSize({ size: PAGE_SIZE, save: true });
      const outcome1 = pageSizeSet();
      const outcome2 = saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${PAGE_SIZE}`
      });

      actions$ = hot('-a', { a: action });

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.setPageSize$).toBeObservable(expected);
    });

    it('fires an action on not saving the value', () => {
      const action = setPageSize({ size: PAGE_SIZE, save: false });
      const outcome = pageSizeSet();

      actions$ = hot('-a', { a: action });

      const expected = hot('-b', { b: outcome });
      expect(effects.setPageSize$).toBeObservable(expected);
    });
  });
});
