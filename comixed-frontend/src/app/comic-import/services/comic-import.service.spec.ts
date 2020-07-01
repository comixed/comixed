/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { ComicImportService } from './comic-import.service';
import {
  COMIC_FILE_1,
  COMIC_FILE_3
} from 'app/comic-import/models/comic-file.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import {
  GET_COMIC_FILES_URL,
  START_IMPORT_URL
} from 'app/comic-import/comic-import.constants';
import { GetComicFilesRequest } from 'app/comic-import/models/net/get-comic-files-request';
import { HttpResponse } from '@angular/common/http';
import { StartImportRequest } from 'app/comic-import/models/net/start-import-request';
import { LoggerModule } from '@angular-ru/logger';

describe('ComicImportService', () => {
  const DIRECTORY = '/Users/comixedreader/Library';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_3];
  const MAXIMUM = 29;

  let service: ComicImportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [ComicImportService]
    });

    service = TestBed.get(ComicImportService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get comic files under a root directory', () => {
    service
      .getFiles(DIRECTORY, MAXIMUM)
      .subscribe(response => expect(response).toEqual(COMIC_FILES));

    const req = httpMock.expectOne(interpolate(GET_COMIC_FILES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      directory: DIRECTORY,
      maximum: MAXIMUM
    } as GetComicFilesRequest);
    req.flush(COMIC_FILES);
  });

  it('can start importing files', () => {
    service
      .startImport(COMIC_FILES, false, true)
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(START_IMPORT_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      filenames: COMIC_FILES.map(entry => entry.filename),
      ignoreMetadata: false,
      deleteBlockedPages: true
    } as StartImportRequest);
    req.flush(new HttpResponse({ status: 200 }));
  });
});
