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
import { RecreateComicFilesEffects } from './recreate-comic-files.effects';
import { ComicService } from '@app/library/services/comic-service';
import { AlertService } from '@app/services/alert-service';
import { expect, vi } from 'vitest';
import { RecreateComicFilesActions } from '@app/library/actions/recreate-comic-files.actions';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ArchiveType } from '@app/library/models/archive-type';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';

describe('RecreateComicFilesEffects', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_ARCHIVE_TYPE = ArchiveType.CB7;

  let actions$: Observable<unknown>;
  let effects: RecreateComicFilesEffects;
  let comicService: ComicService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecreateComicFilesEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MessageService,
        AlertService
      ]
    });

    effects = TestBed.inject(RecreateComicFilesEffects);
    comicService = TestBed.inject(ComicService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('recreating a comic file', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = undefined;
      const action = RecreateComicFilesActions.recreateComic({
        comic: TEST_COMIC,
        targetArchiveType: TEST_ARCHIVE_TYPE
      });
      const outcome = RecreateComicFilesActions.recreateComicSuccess();

      const recreateSpy = vi
        .spyOn(comicService, 'recreateComic')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(firstValueFrom(effects.recreateComic$)).resolves.toEqual(
        outcome
      );
      expect(recreateSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        archiveType: TEST_ARCHIVE_TYPE
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = RecreateComicFilesActions.recreateComic({
        comic: TEST_COMIC,
        targetArchiveType: TEST_ARCHIVE_TYPE
      });
      const outcome = RecreateComicFilesActions.recreateComicFailure();

      const recreateSpy = vi
        .spyOn(comicService, 'recreateComic')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.recreateComic$)).resolves.toEqual(
        outcome
      );
      expect(recreateSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        archiveType: TEST_ARCHIVE_TYPE
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = RecreateComicFilesActions.recreateComic({
        comic: TEST_COMIC,
        targetArchiveType: TEST_ARCHIVE_TYPE
      });
      const outcome = RecreateComicFilesActions.recreateComicFailure();

      const recreateSpy = vi
        .spyOn(comicService, 'recreateComic')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.recreateComic$)).resolves.toEqual(
        outcome
      );
      expect(recreateSpy).toHaveBeenCalledWith({
        comic: TEST_COMIC,
        archiveType: TEST_ARCHIVE_TYPE
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('recreating selected comic files', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = undefined;
      const action = RecreateComicFilesActions.recreateSelectedComics({
        targetArchiveType: TEST_ARCHIVE_TYPE
      });
      const outcome = RecreateComicFilesActions.recreateSelectedComicsSuccess();

      const recreateSpy = vi
        .spyOn(comicService, 'recreateSelectedComics')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.recreateSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(recreateSpy).toHaveBeenCalledWith({
        archiveType: TEST_ARCHIVE_TYPE
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = RecreateComicFilesActions.recreateSelectedComics({
        targetArchiveType: TEST_ARCHIVE_TYPE
      });
      const outcome = RecreateComicFilesActions.recreateSelectedComicsFailure();

      const recreateSpy = vi
        .spyOn(comicService, 'recreateSelectedComics')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.recreateSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(recreateSpy).toHaveBeenCalledWith({
        archiveType: TEST_ARCHIVE_TYPE
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = RecreateComicFilesActions.recreateSelectedComics({
        targetArchiveType: TEST_ARCHIVE_TYPE
      });
      const outcome = RecreateComicFilesActions.recreateSelectedComicsFailure();

      const recreateSpy = vi
        .spyOn(comicService, 'recreateSelectedComics')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.recreateSelectedComics$)
      ).resolves.toEqual(outcome);
      expect(recreateSpy).toHaveBeenCalledWith({
        archiveType: TEST_ARCHIVE_TYPE
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
