/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Comic, ComicFormat, Page, PageType, ScanType } from 'app/comics';
import { ComicService } from 'app/comics/services/comic.service';
import { PageService } from 'app/comics/services/page.service';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  ComicActions,
  ComicActionTypes,
  ComicClearMetadataFailed,
  ComicDeleted,
  ComicDeleteFailed,
  ComicGetFormatsFailed,
  ComicGetIssueFailed,
  ComicGetPageTypesFailed,
  ComicGetScanTypesFailed,
  ComicGotFormats,
  ComicGotIssue,
  ComicGotPageTypes,
  ComicGotScanTypes,
  ComicMarkAsReadFailed,
  ComicMarkedAsRead,
  ComicMetadataCleared,
  ComicPageDeletedSet,
  ComicPageHashBlockingSet,
  ComicPageSaved,
  ComicPageTypeSet,
  ComicRestored,
  ComicRestoreFailed,
  ComicSaved,
  ComicSaveFailed,
  ComicSavePageFailed,
  ComicSetPageDeletedFailed,
  ComicSetPageHashBlockingFailed,
  ComicSetPageTypeFailed
} from '../actions/comic.actions';
import { LoggerService } from '@angular-ru/logger';

@Injectable()
export class ComicEffects {
  constructor(
    private actions$: Actions<ComicActions>,
    private logger: LoggerService,
    private comicService: ComicService,
    private pageService: PageService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getScanTypes$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.GetScanTypes),
    switchMap(action =>
      this.comicService.getScanTypes().pipe(
        map(
          (response: ScanType[]) =>
            new ComicGotScanTypes({ scanTypes: response })
        ),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.get-scan-types.error.detail'
            )
          });
          return of(new ComicGetScanTypesFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicGetScanTypesFailed());
    })
  );

  @Effect()
  getFormats$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.GetFormats),
    switchMap(action =>
      this.comicService.getFormats().pipe(
        map(
          (response: ComicFormat[]) =>
            new ComicGotFormats({ formats: response })
        ),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.get-formats.error.detail'
            )
          });
          return of(new ComicGetFormatsFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicGetFormatsFailed());
    })
  );

  @Effect()
  getPageTypes$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.GetPageTypes),
    switchMap(action =>
      this.comicService.getPageTypes().pipe(
        map(
          (response: PageType[]) =>
            new ComicGotPageTypes({ pageTypes: response })
        ),
        catchError(error => {
          this.logger.error('service failure getting page types:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.get-page-types.error.detail'
            )
          });
          return of(new ComicGetPageTypesFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure getting page types:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicGetPageTypesFailed());
    })
  );

  @Effect()
  getIssue$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.GetIssue),
    map(action => action.payload),
    switchMap(action =>
      this.comicService.getIssue(action.id).pipe(
        map((response: Comic) => new ComicGotIssue({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.get-issue.error.detail',
              { id: action.id }
            )
          });
          return of(new ComicGetIssueFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicGetIssueFailed());
    })
  );

  @Effect()
  savePage$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.SavePage),
    map(action => action.payload),
    switchMap(action =>
      this.pageService.savePage(action.page).pipe(
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.save-page.success.detail'
            )
          })
        ),
        map((response: Comic) => new ComicPageSaved({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.save-page.error.detail'
            )
          });
          return of(new ComicSavePageFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicSavePageFailed());
    })
  );

  @Effect()
  setPageType$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.SetPageType),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: setting page type:', action)),
    switchMap(action =>
      this.pageService.setPageType(action.page, action.pageType).pipe(
        tap(response => this.logger.debug('received response:', response)),
        tap(repsonse =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.set-page-type.success.detail'
            )
          })
        ),
        map((response: Page) => new ComicPageTypeSet({ page: response })),
        catchError(error => {
          this.logger.error('service failure setting page type:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.set-page-type.error.detail'
            )
          });
          return of(new ComicSetPageTypeFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure setting page type:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicSetPageTypeFailed());
    })
  );

  @Effect()
  setPageHashBlocking$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.SetPageHashBlocking),
    map(action => action.payload),
    switchMap(action =>
      this.pageService.setPageHashBlocking(action.page, action.state).pipe(
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.set-page-hash-blocking.success.detail',
              { hash: action.page.hash, state: action.state }
            )
          })
        ),
        map(
          (response: Comic) => new ComicPageHashBlockingSet({ comic: response })
        ),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.set-page-hash-blocking.error.detail'
            )
          });
          return of(new ComicSetPageHashBlockingFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicSetPageHashBlockingFailed());
    })
  );

  @Effect()
  saveComic$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.SaveComic),
    map(action => action.payload),
    switchMap(action =>
      this.comicService.saveComic(action.comic).pipe(
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.save-comic.success.detail'
            )
          })
        ),
        map((response: Comic) => new ComicSaved({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.save-comic.error.detail'
            )
          });
          return of(new ComicSaveFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicSaveFailed());
    })
  );

  @Effect()
  clearMetadata$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.ClearMetadata),
    map(action => action.payload),
    switchMap(action =>
      this.comicService.clearMetadata(action.comic).pipe(
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.clear-metadata.success.detail'
            )
          })
        ),
        map((response: Comic) => new ComicMetadataCleared({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.clear-metadata.error.detail'
            )
          });
          return of(new ComicClearMetadataFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicClearMetadataFailed());
    })
  );

  @Effect()
  deleteComic$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.DeleteComic),
    map(action => action.payload),
    switchMap(action =>
      this.comicService.deleteComic(action.comic).pipe(
        tap((response: Comic) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.delete-comic.success.detail'
            )
          })
        ),
        map((response: Comic) => new ComicDeleted({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.delete-comics.error.detail'
            )
          });
          return of(new ComicDeleteFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicDeleteFailed());
    })
  );

  @Effect()
  restoreComic$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.RestoreComic),
    map(action => action.payload),
    switchMap(action =>
      this.comicService.restoreComic(action.comic).pipe(
        tap((response: Comic) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.restore-comic.success.detail'
            )
          })
        ),
        map((response: Comic) => new ComicRestored({ comic: response })),
        catchError(error => {
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.restore-comic.error.detail'
            )
          });
          return of(new ComicRestoreFailed());
        })
      )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicRestoreFailed());
    })
  );

  @Effect()
  markAsRead$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.MarkAsRead),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: mark comic as read:', action)),
    switchMap(action =>
      this.comicService.markAsRead(action.comic, action.read).pipe(
        tap(response => this.logger.debug('response received:', response)),
        map(
          response =>
            new ComicMarkedAsRead({
              lastRead: !!response.lastRead ? response.lastRead : null
            })
        ),
        catchError(error => {
          this.logger.debug('general failure setting last read date:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.mark-as-read.error-details'
            )
          });
          return of(new ComicMarkAsReadFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.debug('service failure setting last read date:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicMarkAsReadFailed());
    })
  );

  @Effect()
  deletePage$: Observable<Action> = this.actions$.pipe(
    ofType(ComicActionTypes.SetPageDeleted),
    map(action => action.payload),
    tap(action =>
      this.logger.debug('effect: setting page deleted status:', action)
    ),
    switchMap(action =>
      this.comicService.deletePage(action.page, action.deleted).pipe(
        tap(response => this.logger.debug('received response:', response)),
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'comic-effects.set-page-deleted.success.detail',
              { deleted: action.deleted }
            )
          })
        ),
        map((response: Comic) => new ComicPageDeletedSet({ comic: response })),
        catchError(error => {
          this.logger.error(
            'service failure setting page deleted state:',
            error
          );
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'comic-effects.set-page-deleted.error.detail',
              { deleted: action.deleted }
            )
          });
          return of(new ComicSetPageDeletedFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('service failure setting page deleted state:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ComicSetPageDeletedFailed());
    })
  );
}
