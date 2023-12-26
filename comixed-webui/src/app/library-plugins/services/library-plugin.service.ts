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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from '@app/core';
import {
  CREATE_PLUGIN_URL,
  DELETE_PLUGIN_URL,
  LOAD_ALL_PLUGINS_URL,
  RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL,
  RUN_LIBRARY_PLUGIN_ON_SELECTED_COMIC_BOOKS_URL,
  UPDATE_PLUGIN_URL
} from '@app/library-plugins/library-plugins.constants';
import { CreatePluginRequest } from '@app/library-plugins/models/net/create-plugin-request';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';
import { UpdatePluginRequest } from '@app/library-plugins/models/net/update-plugin-request';

@Injectable({
  providedIn: 'root'
})
export class LibraryPluginService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

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
    return this.http.put(
      interpolate(UPDATE_PLUGIN_URL, { pluginId: args.plugin.id }),
      {
        adminOnly: args.plugin.adminOnly,
        properties: new Map(
          args.plugin.properties.map(entry => [entry.name, entry.value])
        )
      } as UpdatePluginRequest
    );
  }

  deletePlugin(args: { plugin: LibraryPlugin }): Observable<any> {
    this.logger.trace('Deleting plugin:', args);
    return this.http.delete(
      interpolate(DELETE_PLUGIN_URL, { pluginId: args.plugin.id })
    );
  }

  runLibraryPluginOnOneComicBook(args: {
    plugin: LibraryPlugin;
    comicBookId: number;
  }): Observable<any> {
    this.logger.trace('Running plugin against one comic book:', args);
    return this.http.post(
      interpolate(RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL, {
        pluginId: args.plugin.id,
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
        pluginId: args.plugin.id
      }),
      {}
    );
  }
}
