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
import { ReadComicListEffects } from './read-comic-list.effects';
import { hot } from 'vitest-marbles';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { vi } from 'vitest';
import { ReadComicListActions } from '@app/account/actions/read-comic-list.actions';
import { ReadComicService } from '@app/account/services/read-comic-service';
import { AlertService } from '@app/services/alert-service';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';

describe('ReadComicListEffects', () => {
  let actions$: Observable<unknown>;
  let effects: ReadComicListEffects;
  let readComicService: ReadComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReadComicListEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        ReadComicService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(ReadComicListEffects);
    readComicService = TestBed.inject(ReadComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    actions$ = hot('', {});
    expect(effects).toBeTruthy();
  });

  describe('marking selected comics', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = undefined;
      const action = ReadComicListActions.markSelectedComics({
        readState: true
      });
      const outcome = ReadComicListActions.markSelectedComicsSuccess();

      const markComicsSpy = vi
        .spyOn(readComicService, 'markSelectedComics')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.markSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(markComicsSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ReadComicListActions.markSelectedComics({
        readState: true
      });
      const outcome = ReadComicListActions.markSelectedComicsFailure();

      const markComicsSpy = vi
        .spyOn(readComicService, 'markSelectedComics')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.markSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(markComicsSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ReadComicListActions.markSelectedComics({
        readState: true
      });
      const outcome = ReadComicListActions.markSelectedComicsFailure();

      const markComicsSpy = vi
        .spyOn(readComicService, 'markSelectedComics')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.markSelectedComics$)
      ).resolves.toEqual(outcome);

      expect(markComicsSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
