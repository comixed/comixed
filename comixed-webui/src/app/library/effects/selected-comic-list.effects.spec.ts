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
import { SelectedComicListEffects } from './selected-comic-list.effects';
import { expect, it, vi } from 'vitest';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('SelectedComicListEffects', () => {
  const TEST_COMIC_ID_LIST = [3, 6, 8, 15, 72, 63, 129];
  const TEST_COMIC = COMIC_1;
  const TEST_SELECTED = Math.random() > 0.5;

  let actions$: Observable<unknown>;
  let effects: SelectedComicListEffects;
  let comicService: ComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SelectedComicListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        ComicService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(SelectedComicListEffects);
    comicService = TestBed.inject(ComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_COMIC_ID_LIST;
      const action = SelectedComicListActions.load();
      const outcome = SelectedComicListActions.loadSuccess({
        comicIds: TEST_COMIC_ID_LIST
      });

      const loadSpy = vi
        .spyOn(comicService, 'loadSelectComicIds')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = SelectedComicListActions.load();
      const outcome = SelectedComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(comicService, 'loadSelectComicIds')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = SelectedComicListActions.load();
      const outcome = SelectedComicListActions.loadFailure();

      const loadSpy = vi
        .spyOn(comicService, 'loadSelectComicIds')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('selecting comics', () => {
    it('should dispatch an action on success', async () => {
      const action = SelectedComicListActions.selectComic({
        comic: TEST_COMIC,
        selected: TEST_SELECTED
      });
      const outcome = SelectedComicListActions.selectComicSuccess();

      const selectSpy = vi
        .spyOn(comicService, 'singleComicSelection')
        .mockReturnValue(of(undefined));

      actions$ = of(action);
      await expect(firstValueFrom(effects.selectComic$)).resolves.toEqual(
        outcome
      );
      expect(selectSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        selected: TEST_SELECTED
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = SelectedComicListActions.selectComic({
        comic: TEST_COMIC,
        selected: TEST_SELECTED
      });
      const outcome = SelectedComicListActions.selectComicFailure();

      const selectSpy = vi
        .spyOn(comicService, 'singleComicSelection')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.selectComic$)).resolves.toEqual(
        outcome
      );
      expect(selectSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        selected: TEST_SELECTED
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = SelectedComicListActions.selectComic({
        comic: TEST_COMIC,
        selected: TEST_SELECTED
      });
      const outcome = SelectedComicListActions.selectComicFailure();

      const selectSpy = vi
        .spyOn(comicService, 'singleComicSelection')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.selectComic$)).resolves.toEqual(
        outcome
      );
      expect(selectSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        selected: TEST_SELECTED
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
