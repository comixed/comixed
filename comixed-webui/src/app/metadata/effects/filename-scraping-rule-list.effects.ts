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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { FilenameScrapingRuleListActions } from '../actions/filename-scraping-rule-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { FilenameScrapingRulesService } from '@app/metadata/services/filename-scraping-rules-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { FileDownloadService } from '@app/file-transfers/services/file-download-service';

@Injectable()
export class FilenameScrapingRuleListEffects {
  readonly logger = inject(LoggerService);
  readonly filenameScrapingRulesService = inject(FilenameScrapingRulesService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly fileDownloadService = inject(FileDownloadService);

  private actions$ = inject(Actions);

  loadFilenameRules$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FilenameScrapingRuleListActions.loadFilenameRules),
      tap(() => this.logger.debug('Loading filename scraping rules')),
      switchMap(() =>
        this.filenameScrapingRulesService.loadRules().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            FilenameScrapingRuleListActions.loadFilenameRulesSuccess({
              rules: response
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rule-list-effects.load-rules.service-failure'
              )
            );
            return of(
              FilenameScrapingRuleListActions.loadFilenameRulesFailure()
            );
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(FilenameScrapingRuleListActions.loadFilenameRulesFailure());
      })
    );
  });

  saveFilenameRules$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FilenameScrapingRuleListActions.saveFilenameRules),
      tap(action =>
        this.logger.debug('Saving filename scraping rules:', action)
      ),
      switchMap(action =>
        this.filenameScrapingRulesService
          .saveRules({ rules: action.rules })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'filename-scraping-rule-list-effects.save-rules.service-success'
                )
              )
            ),
            map(response =>
              FilenameScrapingRuleListActions.saveFilenameRulesSuccess({
                rules: response
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'filename-scraping-rule-list.save-rules.service-failure'
                )
              );
              return of(
                FilenameScrapingRuleListActions.saveFilenameRulesFailure()
              );
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(FilenameScrapingRuleListActions.saveFilenameRulesFailure());
      })
    );
  });

  uploadFilenameRulesFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FilenameScrapingRuleListActions.uploadFilenameRulesFile),
      tap(action =>
        this.logger.debug('Uploading filename scraping rule file:', action)
      ),
      switchMap(action =>
        this.filenameScrapingRulesService
          .uploadRules({ file: action.file })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'filename-scraping-rule-list-effects.upload-file.service-success'
                )
              )
            ),
            map(response =>
              FilenameScrapingRuleListActions.uploadFilenameRulesFileSuccess({
                rules: response
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'filename-scraping-rule-list-effects.upload-file.service-failure'
                )
              );
              return of(
                FilenameScrapingRuleListActions.uploadFilenameRulesFileFailure()
              );
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(
          FilenameScrapingRuleListActions.uploadFilenameRulesFileFailure()
        );
      })
    );
  });

  downloadFilenameRulesFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FilenameScrapingRuleListActions.downloadFilenameRulesFile),
      tap(() => this.logger.debug('Downloading filename scraping rules file')),
      switchMap(() =>
        this.filenameScrapingRulesService.downloadRules().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(response =>
            this.fileDownloadService.saveFile({ document: response })
          ),
          map(response =>
            FilenameScrapingRuleListActions.downloadFilenameRulesFileSuccess({
              document: response
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rule-list-effects.download-file.service-failure'
              )
            );
            return of(
              FilenameScrapingRuleListActions.downloadFilenameRulesFileFailure()
            );
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(
          FilenameScrapingRuleListActions.downloadFilenameRulesFileFailure()
        );
      })
    );
  });
}
