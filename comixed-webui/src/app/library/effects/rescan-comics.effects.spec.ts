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
import { RescanComicsEffects } from './rescan-comics.effects';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';
import { expect, vi } from 'vitest';
import { RescanComicsActions } from '@app/library/actions/rescan-comics.actions';
import { HttpErrorResponse } from '@angular/common/http';

describe('RescanComicsEffects', () => {
  let actions$: Observable<unknown>;
  let effects: RescanComicsEffects;
  let comicService: ComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RescanComicsEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(RescanComicsEffects);
    comicService = TestBed.inject(ComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('rescanning selected comics', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = undefined;
      const action = RescanComicsActions.rescanSelectedComics();
      const outcome = RescanComicsActions.rescanSelectedComicsSuccess();

      const rescanSpy = vi
        .spyOn(comicService, 'rescanSelectedComics')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.rescanSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(rescanSpy).toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = RescanComicsActions.rescanSelectedComics();
      const outcome = RescanComicsActions.rescanSelectedComicsFailure();

      const rescanSpy = vi
        .spyOn(comicService, 'rescanSelectedComics')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.rescanSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(rescanSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = RescanComicsActions.rescanSelectedComics();
      const outcome = RescanComicsActions.rescanSelectedComicsFailure();

      const rescanSpy = vi
        .spyOn(comicService, 'rescanSelectedComics')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.rescanSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(rescanSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
