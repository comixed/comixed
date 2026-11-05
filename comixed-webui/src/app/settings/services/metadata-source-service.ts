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
import { HttpClient } from '@angular/common/http';
import { MetadataSource } from '@app/settings/models/metadata-source';
import { Observable } from 'rxjs';
import { LoggerService } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import {
  CREATE_METADATA_SOURCE_URL,
  LOAD_METADATA_SOURCE_LIST_URL,
  UPDATE_METADATA_SOURCE_URL
} from '@app/settings/settings-constants';
import { SaveMetadataSourceRequest } from '@app/settings/models/net/save-metadata-source-request';

@Service()
export class MetadataSourceService {
  readonly logger = inject(LoggerService);
  readonly client = inject(HttpClient);

  load(): Observable<MetadataSource[]> {
    this.logger.debug('Loading the metadata source list');
    return this.client.get<MetadataSource[]>(
      interpolate(LOAD_METADATA_SOURCE_LIST_URL)
    );
  }

  save(args: { source: MetadataSource }): Observable<MetadataSource> {
    if (!args.source.metadataSourceId) {
      this.logger.debug('Creating metadata source:', args);
      return this.client.post<MetadataSource>(
        interpolate(CREATE_METADATA_SOURCE_URL),
        {
          sourceName: args.source.name,
          preferred: args.source.preferred,
          properties: args.source.properties
        } as SaveMetadataSourceRequest
      );
    } else {
      this.logger.debug('Updating metadata source:', args);
      return this.client.put<MetadataSource>(
        interpolate(UPDATE_METADATA_SOURCE_URL, {
          sourceId: args.source.metadataSourceId
        }),
        {
          sourceName: args.source.name,
          preferred: args.source.preferred,
          properties: args.source.properties
        } as SaveMetadataSourceRequest
      );
    }
  }
}
