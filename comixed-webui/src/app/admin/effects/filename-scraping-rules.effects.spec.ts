/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { Observable, of, throwError } from 'rxjs';

import { FilenameScrapingRulesEffects } from './filename-scraping-rules.effects';
import { FilenameScrapingRulesService } from '@app/admin/services/filename-scraping-rules.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  downloadFilenameScrapingRules,
  downloadFilenameScrapingRulesFailure,
  downloadFilenameScrapingRulesSuccess,
  loadFilenameScrapingRules,
  loadFilenameScrapingRulesFailure,
  loadFilenameScrapingRulesSuccess,
  saveFilenameScrapingRules,
  saveFilenameScrapingRulesFailure,
  saveFilenameScrapingRulesSuccess
} from '@app/admin/actions/filename-scraping-rules.actions';
import { hot } from 'jasmine-marbles';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3,
  FILENAME_SCRAPING_RULES_FILE
} from '@app/admin/admin.fixtures';
import { HttpErrorResponse } from '@angular/common/http';
import { FileDownloadService } from '@app/core/services/file-download.service';

describe('FilenameScrapingRulesEffects', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];
  const FILENAME_RULES_FILE = FILENAME_SCRAPING_RULES_FILE;

  let actions$: Observable<any>;
  let effects: FilenameScrapingRulesEffects;
  let filenameScrapingRuleService: jasmine.SpyObj<FilenameScrapingRulesService>;
  let alertService: AlertService;
  let fileDownloadService: FileDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        FilenameScrapingRulesEffects,
        provideMockActions(() => actions$),
        {
          provide: FilenameScrapingRulesService,
          useValue: {
            load: jasmine.createSpy('FilenameScrapingRulesService.load()'),
            save: jasmine.createSpy('FilenameScrapingRulesService.save()'),
            downloadFilenameScrapingRules: jasmine.createSpy(
              'FilenameScrapingRulesService.downloadFilenameScrapingRules()'
            )
          }
        },
        AlertService,
        FileDownloadService
      ]
    });

    effects = TestBed.inject(FilenameScrapingRulesEffects);
    filenameScrapingRuleService = TestBed.inject(
      FilenameScrapingRulesService
    ) as jasmine.SpyObj<FilenameScrapingRulesService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
    fileDownloadService = TestBed.inject(FileDownloadService);
    spyOn(fileDownloadService, 'saveFile');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading filename scraping rules', () => {
    it('fires an action on success', () => {
      const serviceResponse = RULES;
      const action = loadFilenameScrapingRules();
      const outcome = loadFilenameScrapingRulesSuccess({ rules: RULES });

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.load.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadFilenameScrapingRules();
      const outcome = loadFilenameScrapingRulesFailure();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.load.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadFilenameScrapingRules();
      const outcome = loadFilenameScrapingRulesFailure();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.load.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving filename scraping rules', () => {
    it('fires an action on success', () => {
      const serviceResponse = RULES;
      const action = saveFilenameScrapingRules({ rules: RULES });
      const outcome = saveFilenameScrapingRulesSuccess({ rules: RULES });

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.save.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveFilenameScrapingRules({ rules: RULES });
      const outcome = saveFilenameScrapingRulesFailure();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.save.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveFilenameScrapingRules({ rules: RULES });
      const outcome = saveFilenameScrapingRulesFailure();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('downloading filename scraping rules', () => {
    it('fires an action on success', () => {
      const serviceResponse = FILENAME_RULES_FILE;
      const action = downloadFilenameScrapingRules();
      const outcome = downloadFilenameScrapingRulesSuccess({
        document: FILENAME_RULES_FILE
      });

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.downloadFilenameScrapingRules.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadFilenameScrapingRules$).toBeObservable(expected);
      expect(fileDownloadService.saveFile).toHaveBeenCalledWith({
        document: FILENAME_RULES_FILE
      });
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = downloadFilenameScrapingRules();
      const outcome = downloadFilenameScrapingRulesFailure();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.downloadFilenameScrapingRules.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.downloadFilenameScrapingRules$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = downloadFilenameScrapingRules();
      const outcome = downloadFilenameScrapingRulesFailure();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.downloadFilenameScrapingRules.and.throwError(
        'expected'
      );

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.downloadFilenameScrapingRules$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
