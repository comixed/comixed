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
import { ComicRemovalEffects } from './comic-removal.effects';
import { ComicService } from '@app/library/services/comic-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { AlertService } from '@app/services/alert-service';
import { provideTranslateService } from '@ngx-translate/core';
import { expect, vi } from 'vitest';
import { ComicRemovalActions } from '@app/library/actions/comic-removal.actions';
import { COMIC_1 } from '@app/library/library-fixtures';
import { HttpErrorResponse } from '@angular/common/http';

describe('ComicRemovalEffects', () => {
  const TEST_COMIC = COMIC_1;

  let actions$: Observable<unknown>;
  let effects: ComicRemovalEffects;
  let comicService: ComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicRemovalEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(ComicRemovalEffects);
    comicService = TestBed.inject(ComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('marking one comic for removal', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = undefined;
      const action = ComicRemovalActions.markOneForRemoval({
        comic: TEST_COMIC
      });
      const outcome = ComicRemovalActions.markOneForRemovalSuccess();

      const removalSpy = vi
        .spyOn(comicService, 'singleComicRemoval')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(firstValueFrom(effects.markOneForRemoval$)).resolves.toEqual(
        outcome
      );
      expect(removalSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        removal: true
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ComicRemovalActions.markOneForRemoval({
        comic: TEST_COMIC
      });
      const outcome = ComicRemovalActions.markOneForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'singleComicRemoval')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.markOneForRemoval$)).resolves.toEqual(
        outcome
      );
      expect(removalSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        removal: true
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = ComicRemovalActions.markOneForRemoval({
        comic: TEST_COMIC
      });
      const outcome = ComicRemovalActions.markOneForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'singleComicRemoval')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.markOneForRemoval$)).resolves.toEqual(
        outcome
      );
      expect(removalSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        removal: true
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('unmarking one comic for removal', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = undefined;
      const action = ComicRemovalActions.unmarkOneForRemoval({
        comic: TEST_COMIC
      });
      const outcome = ComicRemovalActions.unmarkOneForRemovalSuccess();

      const removalSpy = vi
        .spyOn(comicService, 'singleComicRemoval')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.unmarkOneForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        removal: false
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ComicRemovalActions.unmarkOneForRemoval({
        comic: TEST_COMIC
      });
      const outcome = ComicRemovalActions.unmarkOneForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'singleComicRemoval')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.unmarkOneForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        removal: false
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = ComicRemovalActions.unmarkOneForRemoval({
        comic: TEST_COMIC
      });
      const outcome = ComicRemovalActions.unmarkOneForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'singleComicRemoval')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.unmarkOneForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        removal: false
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('marking selected comics for removal', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = undefined;
      const action = ComicRemovalActions.markSelectionsForRemoval();
      const outcome = ComicRemovalActions.markSelectionsForRemovalSuccess();

      const removalSpy = vi
        .spyOn(comicService, 'selectedComicsRemoval')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.markSelectionsForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        removal: true
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ComicRemovalActions.markSelectionsForRemoval();
      const outcome = ComicRemovalActions.markSelectionsForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'selectedComicsRemoval')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.markSelectionsForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        removal: true
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = ComicRemovalActions.markSelectionsForRemoval();
      const outcome = ComicRemovalActions.markSelectionsForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'selectedComicsRemoval')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.markSelectionsForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({ removal: true });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('unmarking selected comics for removal', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = undefined;
      const action = ComicRemovalActions.unmarkSelectionsForRemoval();
      const outcome = ComicRemovalActions.unmarkSelectionsForRemovalSuccess();

      const removalSpy = vi
        .spyOn(comicService, 'selectedComicsRemoval')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.unmarkSelectionsForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        removal: false
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ComicRemovalActions.unmarkSelectionsForRemoval();
      const outcome = ComicRemovalActions.unmarkSelectionsForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'selectedComicsRemoval')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.unmarkSelectionsForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        removal: false
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = ComicRemovalActions.unmarkSelectionsForRemoval();
      const outcome = ComicRemovalActions.unmarkSelectionsForRemovalFailure();

      const removalSpy = vi
        .spyOn(comicService, 'selectedComicsRemoval')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.unmarkSelectionsForRemoval$)
      ).resolves.toEqual(outcome);
      expect(removalSpy).toHaveBeenCalledWith({
        removal: false
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
