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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  filenameScrapingRulesLoaded,
  filenameScrapingRulesSaved,
  loadFilenameScrapingRules,
  loadFilenameScrapingRulesFailed,
  saveFilenameScrapingRules,
  saveFilenameScrapingRulesFailed
} from '@app/admin/actions/filename-scraping-rule-list.actions';
import { FilenameScrapingRuleService } from '@app/admin/services/filename-scraping-rule.service';
import { LoggerService } from '@angular-ru/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';
import { of } from 'rxjs';

@Injectable()
export class FilenameScrapingRuleListEffects {
  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadFilenameScrapingRules),
      tap(action =>
        this.logger.trace('Loading filename scraping rules:', action)
      ),
      switchMap(action =>
        this.filenameScrapingRuleService.load().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: FilenameScrapingRule[]) =>
            filenameScrapingRulesLoaded({ rules: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rules.load-all.effect-failure'
              )
            );
            return of(loadFilenameScrapingRulesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadFilenameScrapingRulesFailed());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveFilenameScrapingRules),
      tap(action =>
        this.logger.trace('Saving filename scraping rules:', action)
      ),
      switchMap(action =>
        this.filenameScrapingRuleService.save({ rules: action.rules }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'filename-scraping-rules.save-all.effect-success'
              )
            )
          ),
          map((response: FilenameScrapingRule[]) =>
            filenameScrapingRulesSaved({ rules: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rules.save-all.effect-failure'
              )
            );
            return of(saveFilenameScrapingRulesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveFilenameScrapingRulesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private filenameScrapingRuleService: FilenameScrapingRuleService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
