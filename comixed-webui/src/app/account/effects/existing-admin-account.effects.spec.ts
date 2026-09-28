/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { ExistingAdminAccountEffects } from './existing-admin-account.effects';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { hot } from 'vitest-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

describe.todo('ExistingAdminAccountEffects', () => {
  let actions$: Observable<unknown>;
  let effects: ExistingAdminAccountEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExistingAdminAccountEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ExistingAdminAccountEffects);
  });

  it('should be created', () => {
    actions$ = hot('', {});
    expect(effects).toBeTruthy();
  });
});
