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
  downloadFilenameScrapingRules,
  downloadFilenameScrapingRulesFailure,
  downloadFilenameScrapingRulesSuccess,
  loadFilenameScrapingRules,
  loadFilenameScrapingRulesFailure,
  loadFilenameScrapingRulesSuccess,
  saveFilenameScrapingRules,
  saveFilenameScrapingRulesFailure,
  saveFilenameScrapingRulesSuccess,
  uploadFilenameScrapingRules,
  uploadFilenameScrapingRulesFailure,
  uploadFilenameScrapingRulesSuccess
} from '@app/admin/actions/filename-scraping-rules.actions';
import { FilenameScrapingRulesService } from '@app/admin/services/filename-scraping-rules.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';
import { of } from 'rxjs';
import { DownloadDocument } from '@app/core/models/download-document';
import { FileDownloadService } from '@app/core/services/file-download.service';

@Injectable()
export class FilenameScrapingRulesEffects {
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
            loadFilenameScrapingRulesSuccess({ rules: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rules.load-all.effect-failure'
              )
            );
            return of(loadFilenameScrapingRulesFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadFilenameScrapingRulesFailure());
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
            saveFilenameScrapingRulesSuccess({ rules: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rules.save-all.effect-failure'
              )
            );
            return of(saveFilenameScrapingRulesFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveFilenameScrapingRulesFailure());
      })
    );
  });

  downloadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(downloadFilenameScrapingRules),
      tap(() => this.logger.trace('Downloading filename scraping rules file')),
      switchMap(() =>
        this.filenameScrapingRuleService.downloadFile().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: DownloadDocument) =>
            this.fileDownloadService.saveFile({ document: response })
          ),
          map((response: DownloadDocument) =>
            downloadFilenameScrapingRulesSuccess({ document: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rules.download-file.effect-failure'
              )
            );
            return of(downloadFilenameScrapingRulesFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(downloadFilenameScrapingRulesFailure());
      })
    );
  });

  uploadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(uploadFilenameScrapingRules),
      tap(action =>
        this.logger.debug('Uploading filename scraping rules file:', action)
      ),
      switchMap(action =>
        this.filenameScrapingRuleService.uploadFile({ file: action.file }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'filename-scraping-rules.upload-file.effect-success'
              )
            )
          ),
          map((response: FilenameScrapingRule[]) =>
            uploadFilenameScrapingRulesSuccess({ rules: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'filename-scraping-rules.upload-file.effect-failure'
              )
            );
            return of(uploadFilenameScrapingRulesFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(uploadFilenameScrapingRulesFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private filenameScrapingRuleService: FilenameScrapingRulesService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private fileDownloadService: FileDownloadService
  ) {}
}
