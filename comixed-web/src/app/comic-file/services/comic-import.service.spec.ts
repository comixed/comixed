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

import { TestBed } from '@angular/core/testing';
import { ComicImportService } from './comic-import.service';
import { LoggerModule } from '@angular-ru/logger';
import { interpolate } from '@app/core';
import { LoadComicFilesResponse } from '@app/comic-file/models/net/load-comic-files-response';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoadComicFilesRequest } from '@app/comic-file/models/net/load-comic-files-request';
import { SendComicFilesRequest } from '@app/comic-file/models/net/send-comic-files-request';
import { HttpResponse } from '@angular/common/http';
import {
  ROOT_DIRECTORY,
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from '@app/comic-file/comic-file.fixtures';
import {
  LOAD_COMIC_FILES_URL,
  SEND_COMIC_FILES_URL
} from '@app/comic-file/comic-file.constants';

describe('ComicImportService', () => {
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];
  const MAXIMUM = 100;
  const IGNORE_METADATA = Math.random() > 0.5;
  const DELETE_BLOCKED_PAGES = Math.random() > 0.5;

  let service: ComicImportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ComicImportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load comic files', () => {
    const serviceResponse = {
      files: FILES
    } as LoadComicFilesResponse;
    service
      .loadComicFiles({ directory: ROOT_DIRECTORY, maximum: MAXIMUM })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_COMIC_FILES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      directory: ROOT_DIRECTORY,
      maximum: MAXIMUM
    } as LoadComicFilesRequest);
    req.flush(serviceResponse);
  });

  it('can send comic files', () => {
    const serviceResponse = new HttpResponse({ status: 200 });
    service
      .sendComicFiles({
        files: FILES,
        ignoreMetadata: IGNORE_METADATA,
        deleteBlockedPages: DELETE_BLOCKED_PAGES
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(SEND_COMIC_FILES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      filenames: FILES.map(file => file.filename),
      ignoreMetadata: IGNORE_METADATA,
      deleteBlockedPages: DELETE_BLOCKED_PAGES
    } as SendComicFilesRequest);
    req.flush(serviceResponse);
  });
});
