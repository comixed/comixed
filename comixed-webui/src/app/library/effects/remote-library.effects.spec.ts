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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { hot } from 'vitest-marbles';
import { RemoteLibraryEffects } from '@app/library/effects/remote-library.effects';

describe.todo('RemoteLibraryEffects', () => {
  let actions$: Observable<unknown>;
  let effects: RemoteLibraryEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemoteLibraryEffects, provideMockActions(() => actions$)]
    });

    effects = TestBed.inject(RemoteLibraryEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the remote library state', () => {
    it('should fire an action on success', () => {
      actions$ = hot('', {});
    });

    it('should fire an action on service failure', () => {
      actions$ = hot('', {});
    });

    it('should fire an action on general failure', () => {
      actions$ = hot('', {});
    });
  });
});
