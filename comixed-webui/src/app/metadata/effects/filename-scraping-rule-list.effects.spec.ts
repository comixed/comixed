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
import { FilenameScrapingRuleListEffects } from './filename-scraping-rule-list.effects';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { MessageService } from '@openng/optimus-ui/api';
import { AlertService } from '@app/services/alert-service';
import { provideTranslateService } from '@ngx-translate/core';
import { expect, vi } from 'vitest';
import { FilenameScrapingRuleListActions } from '@app/metadata/actions/filename-scraping-rule-list.actions';
import { FilenameScrapingRulesService } from '@app/metadata/services/filename-scraping-rules-service';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2
} from '@app/metadata/metadata-fixtures';
import { HttpErrorResponse } from '@angular/common/http';
import { DownloadDocument } from '@app/file-transfers/models/download-document';
import { FileDownloadService } from '@app/file-transfers/services/file-download-service';
import { FileSaverService } from 'ngx-filesaver';

describe('FilenameScrapingRuleListEffects', () => {
  const TEST_FILENAME_SCRAPING_RULES_LIST = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2
  ];
  const TEST_RULES_FILE = new File([], 'testing');
  const TEST_DOWNLOAD_DOCUMENT = {
    filename: 'rules.cxrules',
    mediaType: 'application/csv',
    content: 'the content'
  } as DownloadDocument;

  let actions$: Observable<unknown>;
  let effects: FilenameScrapingRuleListEffects;
  let filenameScrapingRulesService: FilenameScrapingRulesService;
  let alertService: AlertService;
  let fileDownloadService: FileDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FilenameScrapingRuleListEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        MessageService,
        AlertService,
        FileSaverService,
        FileDownloadService
      ]
    });

    effects = TestBed.inject(FilenameScrapingRuleListEffects);
    filenameScrapingRulesService = TestBed.inject(FilenameScrapingRulesService);
    alertService = TestBed.inject(AlertService);
    fileDownloadService = TestBed.inject(FileDownloadService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading filename scraping rules', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = TEST_FILENAME_SCRAPING_RULES_LIST;
      const action = FilenameScrapingRuleListActions.loadFilenameRules();
      const outcome = FilenameScrapingRuleListActions.loadFilenameRulesSuccess({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'loadRules')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFilenameRules$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = FilenameScrapingRuleListActions.loadFilenameRules();
      const outcome =
        FilenameScrapingRuleListActions.loadFilenameRulesFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'loadRules')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFilenameRules$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = FilenameScrapingRuleListActions.loadFilenameRules();
      const outcome =
        FilenameScrapingRuleListActions.loadFilenameRulesFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'loadRules')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.loadFilenameRules$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saving filename scraping rules', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = TEST_FILENAME_SCRAPING_RULES_LIST;
      const action = FilenameScrapingRuleListActions.saveFilenameRules({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });
      const outcome = FilenameScrapingRuleListActions.saveFilenameRulesSuccess({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'saveRules')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(firstValueFrom(effects.saveFilenameRules$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = FilenameScrapingRuleListActions.saveFilenameRules({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });
      const outcome =
        FilenameScrapingRuleListActions.saveFilenameRulesFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'saveRules')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.saveFilenameRules$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = FilenameScrapingRuleListActions.saveFilenameRules({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });
      const outcome =
        FilenameScrapingRuleListActions.saveFilenameRulesFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'saveRules')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.saveFilenameRules$)).resolves.toEqual(
        outcome
      );
      expect(loadSpy).toHaveBeenCalledWith({
        rules: TEST_FILENAME_SCRAPING_RULES_LIST
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('uploading filename scraping rules', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = TEST_FILENAME_SCRAPING_RULES_LIST;
      const action = FilenameScrapingRuleListActions.uploadFilenameRulesFile({
        file: TEST_RULES_FILE
      });
      const outcome =
        FilenameScrapingRuleListActions.uploadFilenameRulesFileSuccess({
          rules: TEST_FILENAME_SCRAPING_RULES_LIST
        });

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'uploadRules')
        .mockReturnValue(of(serviceResponse));
      const infoSpy = vi.spyOn(alertService, 'info');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.uploadFilenameRulesFile$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        file: TEST_RULES_FILE
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = FilenameScrapingRuleListActions.uploadFilenameRulesFile({
        file: TEST_RULES_FILE
      });
      const outcome =
        FilenameScrapingRuleListActions.uploadFilenameRulesFileFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'uploadRules')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.uploadFilenameRulesFile$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        file: TEST_RULES_FILE
      });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action = FilenameScrapingRuleListActions.uploadFilenameRulesFile({
        file: TEST_RULES_FILE
      });
      const outcome =
        FilenameScrapingRuleListActions.uploadFilenameRulesFileFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'uploadRules')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.uploadFilenameRulesFile$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalledWith({
        file: TEST_RULES_FILE
      });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('downloading filename scraping rules', () => {
    it('should fire an action on success', async () => {
      const serviceResponse = TEST_DOWNLOAD_DOCUMENT;
      const action =
        FilenameScrapingRuleListActions.downloadFilenameRulesFile();
      const outcome =
        FilenameScrapingRuleListActions.downloadFilenameRulesFileSuccess({
          document: TEST_DOWNLOAD_DOCUMENT
        });

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'downloadRules')
        .mockReturnValue(of(serviceResponse));
      const downloadSpy = vi.spyOn(fileDownloadService, 'saveFile');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.downloadFilenameRulesFile$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(downloadSpy).toHaveBeenCalledWith({
        document: TEST_DOWNLOAD_DOCUMENT
      });
    });

    it('should fire an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action =
        FilenameScrapingRuleListActions.downloadFilenameRulesFile();
      const outcome =
        FilenameScrapingRuleListActions.downloadFilenameRulesFileFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'downloadRules')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.downloadFilenameRulesFile$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should fire an action on general failure', async () => {
      const action =
        FilenameScrapingRuleListActions.downloadFilenameRulesFile();
      const outcome =
        FilenameScrapingRuleListActions.downloadFilenameRulesFileFailure();

      const loadSpy = vi
        .spyOn(filenameScrapingRulesService, 'downloadRules')
        .mockThrow(new Error('Expected'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(
        firstValueFrom(effects.downloadFilenameRulesFile$)
      ).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
