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

import { TestBed } from '@angular/core/testing';
import { MetadataSourceService } from './metadata-source.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { interpolate } from '@app/core';
import {
  CREATE_METADATA_SOURCE_URL,
  DELETE_METADATA_SOURCE_URL,
  LOAD_METADATA_SOURCE_LIST_URL,
  LOAD_METADATA_SOURCE_URL,
  MARK_METADATA_SOURCE_AS_PREFERRED_URL,
  UPDATE_METADATA_SOURCE_URL
} from '@app/comic-metadata/comic-metadata.constants';
import { HttpResponse } from '@angular/common/http';

describe('MetadataSourceService', () => {
  const METADATA_SOURCE = METADATA_SOURCE_1;
  const METADATA_SOURCES = [METADATA_SOURCE_1];

  let service: MetadataSourceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(MetadataSourceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the list of metadata sources', () => {
    service
      .loadAll()
      .subscribe(response => expect(response).toEqual(METADATA_SOURCES));

    const req = httpMock.expectOne(interpolate(LOAD_METADATA_SOURCE_LIST_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(METADATA_SOURCES);
  });

  it('can load a metadata source', () => {
    service
      .loadOne({ id: METADATA_SOURCE.id })
      .subscribe(response => expect(response).toEqual(METADATA_SOURCE));

    const req = httpMock.expectOne(
      interpolate(LOAD_METADATA_SOURCE_URL, { id: METADATA_SOURCE.id })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(METADATA_SOURCE);
  });

  describe('saving a metadata source', () => {
    it('can create a new source', () => {
      service
        .save({
          source: {
            ...METADATA_SOURCE,
            id: null
          }
        })
        .subscribe(response => expect(response).toEqual(METADATA_SOURCE));

      const req = httpMock.expectOne(interpolate(CREATE_METADATA_SOURCE_URL));
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({ ...METADATA_SOURCE, id: null });
      req.flush(METADATA_SOURCE);
    });

    it('can update an existing source', () => {
      service
        .save({
          source: METADATA_SOURCE
        })
        .subscribe(response => expect(response).toEqual(METADATA_SOURCE));

      const req = httpMock.expectOne(
        interpolate(UPDATE_METADATA_SOURCE_URL, { id: METADATA_SOURCE.id })
      );
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(METADATA_SOURCE);
      req.flush(METADATA_SOURCE);
    });
  });

  it('can delete a metadata source', () => {
    service
      .delete({ source: METADATA_SOURCE })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(DELETE_METADATA_SOURCE_URL, { id: METADATA_SOURCE.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });

  it('can mark a metadata source as preferred', () => {
    service
      .markAsPreferred({ id: METADATA_SOURCE.id })
      .subscribe(response => expect(response).toEqual(METADATA_SOURCES));

    const req = httpMock.expectOne(
      interpolate(MARK_METADATA_SOURCE_AS_PREFERRED_URL, {
        id: METADATA_SOURCE.id
      })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(METADATA_SOURCES);
  });
});
