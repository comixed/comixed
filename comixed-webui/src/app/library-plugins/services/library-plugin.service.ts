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

import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { interpolate } from '@app/core';
import {
  CREATE_PLUGIN_URL,
  DELETE_PLUGIN_URL,
  LIBRARY_PLUGIN_LIST_UPDATES,
  LOAD_ALL_PLUGINS_URL,
  RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL,
  RUN_LIBRARY_PLUGIN_ON_SELECTED_COMIC_BOOKS_URL,
  UPDATE_PLUGIN_URL
} from '@app/library-plugins/library-plugins.constants';
import { CreatePluginRequest } from '@app/library-plugins/models/net/create-plugin-request';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { UpdatePluginRequest } from '@app/library-plugins/models/net/update-plugin-request';
import { Store } from '@ngrx/store';
import { selectMessagingState } from '@app/messaging/selectors/messaging.selectors';
import { WebSocketService } from '@app/messaging';
import {
  loadLibraryPlugins,
  loadLibraryPluginsSuccess
} from '@app/library-plugins/actions/library-plugin.actions';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LibraryPluginService {
  http = inject(HttpClient);
  logger = inject(LoggerService);
  store = inject(Store);
  webSocketService = inject(WebSocketService);

  messagingSubscription: Subscription | null = null;
  pluginSubscription: Subscription | null = null;

  constructor() {
    this.messagingSubscription = this.store
      .select(selectMessagingState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        if (state.started && this.pluginSubscription === null) {
          this.pluginSubscription = this.webSocketService.subscribe<
            LibraryPlugin[]
          >(LIBRARY_PLUGIN_LIST_UPDATES, (plugins: LibraryPlugin[]) => {
            this.logger.debug('Received plugin update:', plugins);
            this.store.dispatch(loadLibraryPluginsSuccess({ plugins }));
          });
          this.store.dispatch(loadLibraryPlugins());
        }
        if (!state.started && this.pluginSubscription !== null) {
          this.pluginSubscription.unsubscribe();
          this.pluginSubscription = null;
        }
      });
  }

  loadAll(): Observable<any> {
    this.logger.trace('Loading all library plugins');
    return this.http.get(interpolate(LOAD_ALL_PLUGINS_URL));
  }

  createPlugin(args: { filename: string; language: string }): Observable<any> {
    this.logger.trace('Creating a new plugin:', args);
    return this.http.post(interpolate(CREATE_PLUGIN_URL), {
      language: args.language,
      filename: args.filename
    } as CreatePluginRequest);
  }

  updatePlugin(args: { plugin: LibraryPlugin }): Observable<any> {
    this.logger.trace('Updating plugin:', args);
    const properties = {};
    args.plugin.properties.forEach(
      entry => (properties[entry.name] = entry.value)
    );
    return this.http.put(
      interpolate(UPDATE_PLUGIN_URL, { pluginId: args.plugin.libraryPluginId }),
      {
        adminOnly: args.plugin.adminOnly,
        properties
      } as UpdatePluginRequest
    );
  }

  deletePlugin(args: { plugin: LibraryPlugin }): Observable<any> {
    this.logger.trace('Deleting plugin:', args);
    return this.http.delete(
      interpolate(DELETE_PLUGIN_URL, { pluginId: args.plugin.libraryPluginId })
    );
  }

  runLibraryPluginOnOneComicBook(args: {
    plugin: LibraryPlugin;
    comicBookId: number;
  }): Observable<any> {
    this.logger.trace('Running plugin against one comic book:', args);
    return this.http.post(
      interpolate(RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL, {
        pluginId: args.plugin.libraryPluginId,
        comicBookId: args.comicBookId
      }),
      {}
    );
  }

  runLibraryPluginOnSelectedComicBooks(args: {
    plugin: LibraryPlugin;
  }): Observable<any> {
    this.logger.trace('Running plugin against selected comic books:', args);
    return this.http.post(
      interpolate(RUN_LIBRARY_PLUGIN_ON_SELECTED_COMIC_BOOKS_URL, {
        pluginId: args.plugin.libraryPluginId
      }),
      {}
    );
  }
}
