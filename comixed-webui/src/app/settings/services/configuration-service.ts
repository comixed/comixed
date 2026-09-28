/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { interpolate } from '@app/app-functions';
import { ConfigurationOption } from '@app/settings/models/configuration-option';
import {
  LOAD_CONFIGURATION_URL,
  SAVE_CONFIGURATION_URL
} from '@app/settings/settings-constants';
import { SaveConfigurationResponse } from '@app/settings/models/net/save-configuration-response';
import { SaveConfigurationRequest } from '@app/settings/models/net/save-configuration-request';

@Service()
export class ConfigurationService {
  readonly logger = inject(LoggerService);
  readonly http = inject(HttpClient);

  load(): Observable<ConfigurationOption[]> {
    this.logger.debug('Loading configuration');
    return this.http.get<ConfigurationOption[]>(
      interpolate(LOAD_CONFIGURATION_URL)
    );
  }

  save(args: {
    options: ConfigurationOption[];
  }): Observable<SaveConfigurationResponse> {
    this.logger.debug('Saving configuration:', args);
    return this.http.post<SaveConfigurationResponse>(
      interpolate(SAVE_CONFIGURATION_URL),
      {
        options: args.options
      } as SaveConfigurationRequest
    );
  }
}
