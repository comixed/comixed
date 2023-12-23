/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  createLibraryPlugin,
  createLibraryPluginFailure,
  createLibraryPluginSuccess,
  deleteLibraryPlugin,
  deleteLibraryPluginFailure,
  deleteLibraryPluginSuccess,
  loadLibraryPlugins,
  loadLibraryPluginsFailure,
  loadLibraryPluginsSuccess,
  updateLibraryPlugin,
  updateLibraryPluginFailure,
  updateLibraryPluginSuccess
} from '@app/library-plugins/actions/library-plugin.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { LibraryPluginService } from '@app/library-plugins/services/library-plugin.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { of } from 'rxjs';

@Injectable()
export class LibraryPluginEffects {
  loadLibraryPluginList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadLibraryPlugins),
      tap(() => this.logger.trace('Loading all library plugins')),
      switchMap(action =>
        this.pluginService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LibraryPlugin[]) =>
            loadLibraryPluginsSuccess({ plugins: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library-plugin-list.load-all.effect-failure'
              )
            );
            return of(loadLibraryPluginsFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadLibraryPluginsFailure());
      })
    );
  });

  createLibraryPlugin$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createLibraryPlugin),
      tap(action => this.logger.trace('Creating library plugin:', action)),
      switchMap(action =>
        this.pluginService
          .createPlugin({
            language: action.language,
            filename: action.filename
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: LibraryPlugin) =>
              this.alertService.info(
                this.translateService.instant(
                  'library-plugin-list.create-plugin.effect-success',
                  {
                    name: response.name,
                    version: response.version
                  }
                )
              )
            ),
            map((response: LibraryPlugin) =>
              createLibraryPluginSuccess({ plugin: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'library-plugin-list.create-plugin.effect-failure'
                )
              );
              return of(createLibraryPluginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(createLibraryPluginFailure());
      })
    );
  });

  updateLibraryPlugin$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateLibraryPlugin),
      tap(action => this.logger.trace('Updating plugin:', action.plugin)),
      switchMap(action =>
        this.pluginService.updatePlugin({ plugin: action.plugin }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((repsonse: LibraryPlugin) =>
            this.alertService.info(
              this.translateService.instant(
                'library-plugin-list.update-plugin.effect-success',
                { name: action.plugin.name }
              )
            )
          ),
          map((response: LibraryPlugin) =>
            updateLibraryPluginSuccess({ plugin: action.plugin })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library-plugin-list.update-plugin.effect-failure',
                { name: action.plugin.name }
              )
            );
            return of(updateLibraryPluginFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(updateLibraryPluginFailure());
      })
    );
  });

  deleteLibraryPlugin$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteLibraryPlugin),
      tap(action => this.logger.trace('Deleting library plugin:', action)),
      switchMap(action =>
        this.pluginService.deletePlugin({ plugin: action.plugin }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'library-plugin-list.delete-plugin.effect-success',
                {
                  name: action.plugin.name,
                  version: action.plugin.version
                }
              )
            )
          ),
          map(() => deleteLibraryPluginSuccess()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'library-plugin-list.delete-plugin.effect-failure'
              )
            );
            return of(deleteLibraryPluginFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteLibraryPluginFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private pluginService: LibraryPluginService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
