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
import { LoggerService } from '@angular-ru/logger';
import { BehaviorSubject, Observable } from 'rxjs';
import { PluginDescriptor } from 'app/library/models/plugin-descriptor';
import { Store } from '@ngrx/store';
import { AppState } from 'app/library';
import { PLUGIN_FEATURE_KEY } from 'app/library/reducers/plugin.reducer';
import { filter } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  GetAllPlugins,
  ReloadPlugins
} from 'app/library/actions/plugin.actions';

@Injectable()
export class PluginAdaptor {
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _plugins$ = new BehaviorSubject<PluginDescriptor[]>([]);

  constructor(private logger: LoggerService, private store: Store<AppState>) {
    this.store
      .select(PLUGIN_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.logger.debug('plugin state updated:', state);
        if (!_.isEqual(this._plugins$.getValue(), state.plugins)) {
          this._plugins$.next(state.plugins);
        }
        if (this._loading$.getValue() !== state.loading) {
          this._loading$.next(state.loading);
        }
      });
  }

  getAllPlugins() {
    this.logger.debug('firing an action to get all plugins');
    this.store.dispatch(new GetAllPlugins());
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get plugins$(): Observable<PluginDescriptor[]> {
    return this._plugins$.asObservable();
  }

  reloadPlugins(): void {
    this.logger.debug('reloading plugins');
    this.store.dispatch(new ReloadPlugins());
  }
}
