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
import { LOAD_METADATA_SOURCE_LIST_URL } from '@app/comic-metadata/comic-metadata.constants';

describe('MetadataSourceService', () => {
  const SOURCES = [METADATA_SOURCE_1];

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
      .loadMetadataSourceList()
      .subscribe(response => expect(response).toEqual(SOURCES));

    const req = httpMock.expectOne(interpolate(LOAD_METADATA_SOURCE_LIST_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(SOURCES);
  });
});
