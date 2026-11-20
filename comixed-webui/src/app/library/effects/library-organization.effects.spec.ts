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
import { LibraryOrganizationEffects } from './library-organization.effects';
import { LibraryService } from '@app/library/services/library-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { expect, vi } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { LibraryOrganizationActions } from '@app/library/actions/library-organization.actions';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { MessageService } from '@openng/optimus-ui/api';

describe('LibraryOrganizationEffects', () => {
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let actions$: Observable<unknown>;
  let effects: LibraryOrganizationEffects;
  let libraryService: LibraryService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LibraryOrganizationEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(LibraryOrganizationEffects);
    libraryService = TestBed.inject(LibraryService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('organizing selected comics', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = undefined;
      const action = LibraryOrganizationActions.organizeSelectedComics();
      const outcome =
        LibraryOrganizationActions.organizeSelectedComicsSuccess();

      const recreateSpy = vi
        .spyOn(libraryService, 'organizeSelectedComics')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.organizeSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(recreateSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = LibraryOrganizationActions.organizeSelectedComics();
      const outcome =
        LibraryOrganizationActions.organizeSelectedComicsFailure();

      const recreateSpy = vi
        .spyOn(libraryService, 'organizeSelectedComics')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.organizeSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(recreateSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = LibraryOrganizationActions.organizeSelectedComics();
      const outcome =
        LibraryOrganizationActions.organizeSelectedComicsFailure();

      const recreateSpy = vi
        .spyOn(libraryService, 'organizeSelectedComics')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.organizeSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(recreateSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('organizing all comics', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = undefined;
      const action = LibraryOrganizationActions.organizeAllComics();
      const outcome = LibraryOrganizationActions.organizeAllComicsSuccess();

      const recreateSpy = vi
        .spyOn(libraryService, 'organizeAllComics')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(firstValueFrom(effects.organizeAllComics$)).resolves.toEqual(
        outcome
      );
      expect(recreateSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = LibraryOrganizationActions.organizeAllComics();
      const outcome = LibraryOrganizationActions.organizeAllComicsFailure();

      const recreateSpy = vi
        .spyOn(libraryService, 'organizeAllComics')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.organizeAllComics$)).resolves.toEqual(
        outcome
      );
      expect(recreateSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = LibraryOrganizationActions.organizeAllComics();
      const outcome = LibraryOrganizationActions.organizeAllComicsFailure();

      const recreateSpy = vi
        .spyOn(libraryService, 'organizeAllComics')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.organizeAllComics$)).resolves.toEqual(
        outcome
      );
      expect(recreateSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
