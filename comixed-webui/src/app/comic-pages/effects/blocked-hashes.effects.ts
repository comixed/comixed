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
import { BlockedPageService } from '@app/comic-pages/services/blocked-page.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import {
  downloadBlockedHashesFile,
  downloadBlockedHashesFileFailure,
  downloadBlockedHashesFileSuccess,
  loadBlockedHashDetail,
  loadBlockedHashDetailFailure,
  loadBlockedHashDetailSuccess,
  loadBlockedHashList,
  loadBlockedHashListFailure,
  loadBlockedHashListSuccess,
  markPagesWithHash,
  markPagesWithHashFailure,
  markPagesWithHashSuccess,
  saveBlockedHash,
  saveBlockedHashFailure,
  saveBlockedHashSuccess,
  setBlockedStateForHash,
  setBlockedStateForHashFailue,
  setBlockedStateForHashSuccess,
  uploadBlockedHashesFile,
  uploadBlockedHashesFileFailure,
  uploadBlockedHashesFileSuccess
} from '@app/comic-pages/actions/blocked-hashes.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DownloadDocument } from '@app/core/models/download-document';
import { AlertService } from '@app/core/services/alert.service';
import { FileDownloadService } from '@app/core/services/file-download.service';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';

@Injectable()
export class BlockedHashesEffects {
  loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBlockedHashList),
      tap(action => this.logger.trace('Loading blocked page list:', action)),
      switchMap(action =>
        this.blockedPageService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: BlockedHash[]) =>
            loadBlockedHashListSuccess({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-hash-list.load-effect-failure'
              )
            );
            return of(loadBlockedHashListFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadBlockedHashListFailure());
      })
    );
  });
  loadByHash$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBlockedHashDetail),
      tap(action =>
        this.logger.debug('Effect: loading blocked page by hash:', action)
      ),
      switchMap(action =>
        this.blockedPageService.loadByHash({ hash: action.hash }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: BlockedHash) =>
            loadBlockedHashDetailSuccess({ entry: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-hash.load-by-hash-effect-error',
                { hash: action.hash }
              )
            );
            return of(loadBlockedHashDetailFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-error')
        );
        return of(loadBlockedHashDetailFailure());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveBlockedHash),
      tap(action => this.logger.debug('Effect: save blocked page:', action)),
      switchMap(action =>
        this.blockedPageService.save({ entry: action.entry }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: BlockedHash) =>
            this.alertService.info(
              this.translateService.instant(
                'blocked-hash.editing.save-effect-success'
              )
            )
          ),
          map((response: BlockedHash) =>
            saveBlockedHashSuccess({ entry: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-hash.editing.save-effect-failure'
              )
            );
            return of(saveBlockedHashFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveBlockedHashFailure());
      })
    );
  });

  markPagesWithHash$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markPagesWithHash),
      tap(action =>
        this.logger.trace('Set blocked page deletion flags:', action)
      ),
      switchMap(action =>
        this.blockedPageService
          .markPagesWithHash({
            hashes: action.hashes,
            deleted: action.deleted
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'blocked-hash-list.mark-pages-with-hash.effect-success',
                  { deleted: action.deleted }
                )
              )
            ),
            map(() => markPagesWithHashSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'blocked-hash-list.mark-pages-with-hash.effect-failure',
                  { deleted: action.deleted }
                )
              );
              return of(markPagesWithHashFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(markPagesWithHashFailure());
      })
    );
  });

  downloadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(downloadBlockedHashesFile),
      tap(action =>
        this.logger.debug('Effect: download blocked pages file:', action)
      ),
      switchMap(action =>
        this.blockedPageService.downloadFile().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: DownloadDocument) =>
            this.fileDownloadService.saveFile({ document: response })
          ),
          map((response: DownloadDocument) =>
            downloadBlockedHashesFileSuccess({ document: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-hash-list.download-file.effect-failure'
              )
            );
            return of(downloadBlockedHashesFileFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(downloadBlockedHashesFileFailure());
      })
    );
  });

  uploadFile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(uploadBlockedHashesFile),
      tap(action =>
        this.logger.debug('Effect: upload blocked page file:', action)
      ),
      switchMap(action =>
        this.blockedPageService.uploadFile({ file: action.file }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: BlockedHash[]) =>
            this.alertService.info(
              this.translateService.instant(
                'blocked-hash-list.upload-file.effect-success',
                { count: response.length }
              )
            )
          ),
          mergeMap((response: BlockedHash[]) => [
            uploadBlockedHashesFileSuccess({ entries: response }),
            loadBlockedHashListSuccess({ entries: response })
          ]),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-hash-list.upload-file.effect-failure'
              )
            );
            return of(uploadBlockedHashesFileFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(uploadBlockedHashesFileFailure());
      })
    );
  });

  setBlockedState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setBlockedStateForHash),
      tap(action => this.logger.debug('Effect: set blocked state:', action)),
      switchMap(action =>
        this.blockedPageService
          .setBlockedState({ hashes: action.hashes, blocked: action.blocked })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'blocked-hash.set-state.effect-success',
                  { blocked: action.blocked }
                )
              )
            ),
            map(() => setBlockedStateForHashSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'blocked-hash.set-state.effect-failure',
                  { blocked: action.blocked }
                )
              );
              return of(setBlockedStateForHashFailue());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setBlockedStateForHashFailue());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private blockedPageService: BlockedPageService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private fileDownloadService: FileDownloadService
  ) {}
}
