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
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { HttpClient } from '@angular/common/http';
import { interpolate } from 'app/app.functions';
import {
  GET_ALL_PLUGINS_URL,
  RELOAD_PLUGINS_URL
} from 'app/library/library.constants';

@Injectable({
  providedIn: 'root'
})
export class PluginService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  getAllPlugins(): Observable<any> {
    this.logger.debug('[GET] http request: get all plugins');
    return this.http.get(interpolate(GET_ALL_PLUGINS_URL));
  }

  reloadPlugins(): Observable<any> {
    this.logger.debug('[POST] http request: reload plugins');
    return this.http.post(interpolate(RELOAD_PLUGINS_URL), {});
  }
}
