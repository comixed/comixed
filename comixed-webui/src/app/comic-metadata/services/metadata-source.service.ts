/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import {
  CREATE_METADATA_SOURCE_URL,
  DELETE_METADATA_SOURCE_URL,
  LOAD_METADATA_SOURCE_LIST_URL,
  LOAD_METADATA_SOURCE_URL,
  MARK_METADATA_SOURCE_AS_PREFERRED_URL,
  UPDATE_METADATA_SOURCE_URL
} from '@app/comic-metadata/comic-metadata.constants';
import { interpolate } from '@app/core';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

@Injectable({
  providedIn: 'root'
})
export class MetadataSourceService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  loadAll(): Observable<any> {
    this.logger.trace('Loading metadata source list');
    return this.http.get(interpolate(LOAD_METADATA_SOURCE_LIST_URL));
  }

  loadOne(args: { id: number }): Observable<any> {
    this.logger.trace('Loading  metadata source:', args);
    return this.http.get(
      interpolate(LOAD_METADATA_SOURCE_URL, { id: args.id })
    );
  }

  save(args: { source: MetadataSource }): Observable<any> {
    if (!!args.source.id) {
      this.logger.trace('Updating metadata source:', args);
      return this.http.put(
        interpolate(UPDATE_METADATA_SOURCE_URL, { id: args.source.id }),
        args.source
      );
    } else {
      this.logger.trace('Creating metadata source:', args);
      return this.http.post(
        interpolate(CREATE_METADATA_SOURCE_URL),
        args.source
      );
    }
  }

  delete(args: { source: MetadataSource }): Observable<any> {
    this.logger.trace('Deleting metadata source:', args);
    return this.http.delete(
      interpolate(DELETE_METADATA_SOURCE_URL, { id: args.source.id })
    );
  }

  markAsPreferred(args: { id: number }): Observable<any> {
    this.logger.trace('Marking metadata source as preferred:', args);
    return this.http.post(
      interpolate(MARK_METADATA_SOURCE_AS_PREFERRED_URL, { id: args.id }),
      {}
    );
  }
}
