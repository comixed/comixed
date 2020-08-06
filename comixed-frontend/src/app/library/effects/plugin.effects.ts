/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { Observable, of } from 'rxjs';
import {
  AllPluginsReceived,
  GetAllPluginsFailed,
  PluginActions,
  PluginActionTypes,
  PluginsReloaded,
  ReloadPluginsFailed
} from '../actions/plugin.actions';
import { LoggerService } from '@angular-ru/logger';
import { Action } from '@ngrx/store';
import { PluginService } from 'app/library/services/plugin.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { PluginDescriptor } from 'app/library/models/plugin-descriptor';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PluginEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions<PluginActions>,
    private pluginService: PluginService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getAllPlugins$: Observable<Action> = this.actions$.pipe(
    ofType(PluginActionTypes.GetAll),
    tap(action => this.logger.debug('effect: get all publins:', action)),
    switchMap(action =>
      this.pluginService.getAllPlugins().pipe(
        tap(response => this.logger.debug('received response:', response)),
        map(
          (response: PluginDescriptor[]) =>
            new AllPluginsReceived({ pluginDescriptors: response })
        ),
        catchError(error => {
          this.logger.error('service failure getting all plugins:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'plugin-effects.get-all.error.detail'
            )
          });
          return of(new GetAllPluginsFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure getting all plugins:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new GetAllPluginsFailed());
    })
  );

  @Effect()
  reloadPlugins$: Observable<Action> = this.actions$.pipe(
    ofType(PluginActionTypes.Reload),
    tap(action => this.logger.debug('effect: reload plugins:', action)),
    switchMap(action =>
      this.pluginService.reloadPlugins().pipe(
        tap(response => this.logger.debug('response received:', response)),
        tap((response: PluginDescriptor[]) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'plugin-effects.reload-plugins.success.detail',
              { count: response.length }
            )
          })
        ),
        map(
          (response: PluginDescriptor[]) =>
            new PluginsReloaded({ pluginDescriptors: response })
        ),
        catchError(error => {
          this.logger.debug('service failure reloading plugins:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'plugin-effects.reload-plugins.error.detail'
            )
          });
          return of(new ReloadPluginsFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.debug('service failure reloading plugins:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ReloadPluginsFailed());
    })
  );
}
