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
import { ComicFileListEffects } from '@app/library/effects/comic-file-list.effects';
import { expect, vi } from 'vitest';
import { ComicFileService } from '@app/library/services/comic-file-service';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import { COMIC_FILE_1 } from '@app/library/library-fixtures';
import { ComicFileGroup } from '@app/library/models/comic-file-group';
import { ComicFileListActions } from '@app/library/actions/comic-file-list.actions';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { provideTranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/services/alert-service';

describe('ComicFileListEffects', () => {
  const TEST_COMIC_FILE = COMIC_FILE_1;
  const TEST_FILENAME = TEST_COMIC_FILE.filename;
  const TEST_DIRECTORY = '/Users/comixed/Library/Comics/import';
  const TEST_MAXIMUM = 100;
  const TEST_GROUP_LIST: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [TEST_COMIC_FILE]
    }
  ];
  const TEST_SELECTED = Math.random() > 0.5;
  const TEST_SINGLE = Math.random() > 0.5;

  let actions$: Observable<unknown>;
  let effects: ComicFileListEffects;
  let comicFileService: ComicFileService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicFileListEffects,
        provideMockActions(() => actions$),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        ComicFileService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(ComicFileListEffects);
    comicFileService = TestBed.inject(ComicFileService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading comic files from the session', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        groups: TEST_GROUP_LIST
      } as LoadComicFilesResponse;
      const action = ComicFileListActions.loadFromSession();
      const outcome = ComicFileListActions.loadFromSessionSuccess({
        groups: TEST_GROUP_LIST
      });

      const loadSpy = vi
        .spyOn(comicFileService, 'loadFromSession')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFromSession$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicFileListActions.loadFromSession();
      const outcome = ComicFileListActions.loadFromSessionFailure();

      const loadSpy = vi
        .spyOn(comicFileService, 'loadFromSession')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFromSession$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicFileListActions.loadFromSession();
      const outcome = ComicFileListActions.loadFromSessionFailure();

      const loadSpy = vi
        .spyOn(comicFileService, 'loadFromSession')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFromSession$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('loading comic files from disk', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        groups: TEST_GROUP_LIST
      } as LoadComicFilesResponse;
      const action = ComicFileListActions.loadFromDisk({
        directory: TEST_DIRECTORY,
        maximum: TEST_MAXIMUM
      });
      const outcome = ComicFileListActions.loadFromDiskSuccess({
        groups: TEST_GROUP_LIST
      });

      const loadSpy = vi
        .spyOn(comicFileService, 'loadFromDisk')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFromDisk$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicFileListActions.loadFromDisk({
        directory: TEST_DIRECTORY,
        maximum: TEST_MAXIMUM
      });
      const outcome = ComicFileListActions.loadFromDiskFailure();

      const loadSpy = vi
        .spyOn(comicFileService, 'loadFromDisk')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFromDisk$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicFileListActions.loadFromDisk({
        directory: TEST_DIRECTORY,
        maximum: TEST_MAXIMUM
      });
      const outcome = ComicFileListActions.loadFromDiskFailure();

      const loadSpy = vi
        .spyOn(comicFileService, 'loadFromDisk')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFromDisk$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('setting the select state on comic files', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        groups: TEST_GROUP_LIST
      } as LoadComicFilesResponse;
      const action = ComicFileListActions.select({
        filename: TEST_FILENAME,
        selected: TEST_SELECTED,
        single: TEST_SINGLE
      });
      const outcome = ComicFileListActions.selectSuccess({
        groups: TEST_GROUP_LIST
      });

      const toggleSpy = vi
        .spyOn(comicFileService, 'setComicFileSelected')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.selectComicFiles$)).resolves.toEqual(
        outcome
      );
      expect(toggleSpy).toHaveBeenCalledWith({
        filename: TEST_FILENAME,
        selected: TEST_SELECTED,
        single: TEST_SINGLE
      });
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicFileListActions.select({
        filename: TEST_FILENAME,
        selected: TEST_SELECTED,
        single: TEST_SINGLE
      });
      const outcome = ComicFileListActions.selectFailure();

      const toggleSpy = vi
        .spyOn(comicFileService, 'setComicFileSelected')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.selectComicFiles$)).resolves.toEqual(
        outcome
      );
      expect(toggleSpy).toHaveBeenCalledWith({
        filename: TEST_FILENAME,
        selected: TEST_SELECTED,
        single: TEST_SINGLE
      });
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicFileListActions.select({
        filename: TEST_FILENAME,
        selected: TEST_SELECTED,
        single: TEST_SINGLE
      });
      const outcome = ComicFileListActions.selectFailure();

      const toggleSpy = vi
        .spyOn(comicFileService, 'setComicFileSelected')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.selectComicFiles$)).resolves.toEqual(
        outcome
      );
      expect(toggleSpy).toHaveBeenCalledWith({
        filename: TEST_FILENAME,
        selected: TEST_SELECTED,
        single: TEST_SINGLE
      });
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  describe('starting the import', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = undefined;
      const action = ComicFileListActions.import();
      const outcome = ComicFileListActions.importSuccess();

      const importSpy = vi
        .spyOn(comicFileService, 'import')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.import$)).resolves.toEqual(outcome);
      expect(importSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new Error('Service failure');
      const action = ComicFileListActions.import();
      const outcome = ComicFileListActions.importFailure();

      const importSpy = vi
        .spyOn(comicFileService, 'import')
        .mockReturnValue(throwError(() => serviceResponse));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.import$)).resolves.toEqual(outcome);
      expect(importSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ComicFileListActions.import();
      const outcome = ComicFileListActions.importFailure();

      const importSpy = vi
        .spyOn(comicFileService, 'import')
        .mockThrow(new Error('General failure'));
      const alertSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.import$)).resolves.toEqual(outcome);
      expect(importSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
