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
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@angular-ru/logger';
import {
  LOAD_CONFIGURATION_OPTIONS_URL,
  SAVE_CONFIGURATION_OPTIONS_URL
} from '@app/admin/admin.constants';
import { interpolate } from '@app/core';
import { ConfigurationOption } from '@app/admin/models/configuration-option';
import { SaveConfigurationOptionsRequest } from '@app/admin/models/net/save-configuration-options-request';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadAll(): Observable<any> {
    this.logger.debug('Service: loading configuration options');
    return this.http.get(interpolate(LOAD_CONFIGURATION_OPTIONS_URL));
  }

  saveOptions(args: { options: ConfigurationOption[] }): Observable<any> {
    this.logger.debug('Service: save configuration options:', args);
    return this.http.post(interpolate(SAVE_CONFIGURATION_OPTIONS_URL), {
      options: args.options
    } as SaveConfigurationOptionsRequest);
  }
}
