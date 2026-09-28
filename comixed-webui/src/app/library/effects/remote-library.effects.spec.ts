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
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { RemoteLibraryEffects } from '@app/library/effects/remote-library.effects';
import { expect, it, vi } from 'vitest';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { LibraryService } from '@app/library/services/library-service';
import { REMOTE_LIBRARY } from '@app/library/library-fixtures';
import { RemoteLibraryActions } from '@app/library/actions/remote-library.actions';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';

describe('RemoteLibraryEffects', () => {
  const TEST_REMOTE_LIBRARY = REMOTE_LIBRARY;
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let actions$: Observable<unknown>;
  let effects: RemoteLibraryEffects;
  let libraryService: LibraryService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RemoteLibraryEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState }),
        LibraryService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(RemoteLibraryEffects);
    libraryService = TestBed.inject(LibraryService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the remote library state', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_REMOTE_LIBRARY;
      const action = RemoteLibraryActions.load();
      const outcome = RemoteLibraryActions.loadSuccess({
        state: TEST_REMOTE_LIBRARY
      });

      const loadSpy = vi
        .spyOn(libraryService, 'loadState')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadState$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = RemoteLibraryActions.load();
      const outcome = RemoteLibraryActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadState')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadState$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = RemoteLibraryActions.load();
      const outcome = RemoteLibraryActions.loadFailure();

      const loadSpy = vi
        .spyOn(libraryService, 'loadState')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadState$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
