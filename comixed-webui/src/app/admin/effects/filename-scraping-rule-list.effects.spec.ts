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

import { FilenameScrapingRuleListEffects } from './filename-scraping-rule-list.effects';
import { FilenameScrapingRuleService } from '@app/admin/services/filename-scraping-rule.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  filenameScrapingRulesLoaded,
  filenameScrapingRulesSaved,
  loadFilenameScrapingRules,
  loadFilenameScrapingRulesFailed,
  saveFilenameScrapingRules,
  saveFilenameScrapingRulesFailed
} from '@app/admin/actions/filename-scraping-rule-list.actions';
import { hot } from 'jasmine-marbles';
import {
  FILENAME_SCRAPING_RULE_1,
  FILENAME_SCRAPING_RULE_2,
  FILENAME_SCRAPING_RULE_3
} from '@app/admin/admin.fixtures';
import { HttpErrorResponse } from '@angular/common/http';

describe('FilenameScrapingRuleListEffects', () => {
  const RULES = [
    FILENAME_SCRAPING_RULE_1,
    FILENAME_SCRAPING_RULE_2,
    FILENAME_SCRAPING_RULE_3
  ];

  let actions$: Observable<any>;
  let effects: FilenameScrapingRuleListEffects;
  let filenameScrapingRuleService: jasmine.SpyObj<FilenameScrapingRuleService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        FilenameScrapingRuleListEffects,
        provideMockActions(() => actions$),
        {
          provide: FilenameScrapingRuleService,
          useValue: {
            load: jasmine.createSpy('FilenameScrapingRuleService.load()'),
            save: jasmine.createSpy('FilenameScrapingRuleService.save()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(FilenameScrapingRuleListEffects);
    filenameScrapingRuleService = TestBed.inject(
      FilenameScrapingRuleService
    ) as jasmine.SpyObj<FilenameScrapingRuleService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading filename scraping rules', () => {
    it('fires an action on success', () => {
      const serviceResponse = RULES;
      const action = loadFilenameScrapingRules();
      const outcome = filenameScrapingRulesLoaded({ rules: RULES });

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.load.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.load$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadFilenameScrapingRules();
      const outcome = loadFilenameScrapingRulesFailed();

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
      const outcome = loadFilenameScrapingRulesFailed();

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
      const outcome = filenameScrapingRulesSaved({ rules: RULES });

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.save.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveFilenameScrapingRules({ rules: RULES });
      const outcome = saveFilenameScrapingRulesFailed();

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
      const outcome = saveFilenameScrapingRulesFailed();

      actions$ = hot('-a', { a: action });
      filenameScrapingRuleService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
