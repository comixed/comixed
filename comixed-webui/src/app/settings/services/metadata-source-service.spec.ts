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

import { TestBed } from '@angular/core/testing';
import { MetadataSourceService } from './metadata-source-service';
import {
  METADATA_SOURCE_1,
  METADATA_SOURCE_2
} from '@app/settings/settings-fixtures';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import {
  CREATE_METADATA_SOURCE_URL,
  LOAD_METADATA_SOURCE_LIST_URL,
  UPDATE_METADATA_SOURCE_URL
} from '@app/settings/settings-constants';
import { SaveMetadataSourceRequest } from '@app/settings/models/net/save-metadata-source-request';

describe('MetadataSourceService', () => {
  const TEST_NEW_METADATA_SOURCE = {
    ...METADATA_SOURCE_1,
    metadataSourceId: null
  };
  const TEST_METADATA_SOURCE = METADATA_SOURCE_1;
  const TEST_METADATA_SOURCE_LIST = [METADATA_SOURCE_1, METADATA_SOURCE_2];

  let service: MetadataSourceService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(MetadataSourceService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the list of metadata sources', () => {
    const serverResponse = TEST_METADATA_SOURCE_LIST;

    service.load().subscribe({
      next: response => expect(response).toEqual(TEST_METADATA_SOURCE_LIST)
    });

    const req = httpController.expectOne(
      interpolate(LOAD_METADATA_SOURCE_LIST_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should create a metadata source', () => {
    const serverResponse = TEST_METADATA_SOURCE_LIST;

    service.save({ source: TEST_NEW_METADATA_SOURCE }).subscribe({
      next: response => expect(response).toEqual(TEST_METADATA_SOURCE_LIST)
    });

    const req = httpController.expectOne(
      interpolate(CREATE_METADATA_SOURCE_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      sourceName: TEST_NEW_METADATA_SOURCE.name,
      preferred: TEST_NEW_METADATA_SOURCE.preferred,
      properties: TEST_NEW_METADATA_SOURCE.properties
    } as SaveMetadataSourceRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should update a metadata source', () => {
    const serverResponse = TEST_METADATA_SOURCE_LIST;

    service.save({ source: TEST_METADATA_SOURCE }).subscribe({
      next: response => expect(response).toEqual(TEST_METADATA_SOURCE_LIST)
    });

    const req = httpController.expectOne(
      interpolate(UPDATE_METADATA_SOURCE_URL, {
        sourceId: TEST_METADATA_SOURCE.metadataSourceId
      })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      sourceName: TEST_METADATA_SOURCE.name,
      preferred: TEST_METADATA_SOURCE.preferred,
      properties: TEST_METADATA_SOURCE.properties
    } as SaveMetadataSourceRequest);
    req.flush(serverResponse);
    httpController.verify();
  });
});
