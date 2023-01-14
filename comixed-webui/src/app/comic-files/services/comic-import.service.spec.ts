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
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoadComicFilesRequest } from '@app/library/models/net/load-comic-files-request';
import { SendComicFilesRequest } from '@app/library/models/net/send-comic-files-request';
import { HttpResponse } from '@angular/common/http';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  ROOT_DIRECTORY
} from '@app/comic-files/comic-file.fixtures';
import {
  LOAD_COMIC_FILES_URL,
  SCRAPE_FILENAME_URL,
  SEND_COMIC_FILES_URL
} from '@app/comic-files/comic-file.constants';
import {
  COMIC_BOOK_2,
  COMIC_DETAIL_2
} from '@app/comic-books/comic-books.fixtures';
import { FilenameMetadataResponse } from '@app/comic-files/models/net/filename-metadata-response';
import { FilenameMetadataRequest } from '@app/comic-files/models/net/filename-metadata-request';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

describe('ComicImportService', () => {
  const GROUPS: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [COMIC_FILE_1, COMIC_FILE_3]
    },
    {
      directory: 'directory2',
      files: [COMIC_FILE_2]
    }
  ];
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
  const MAXIMUM = 100;
  const FILENAME = COMIC_BOOK_2.baseFilename;
  const SERIES = COMIC_DETAIL_2.series;
  const VOLUME = COMIC_DETAIL_2.volume;
  const ISSUE_NUMBER = COMIC_DETAIL_2.issueNumber;
  const COVER_DATE = COMIC_DETAIL_2.coverDate;

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
      groups: GROUPS
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
        files: FILES
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(SEND_COMIC_FILES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      filenames: FILES.map(file => file.filename)
    } as SendComicFilesRequest);
    req.flush(serviceResponse);
  });

  it('can scrape a filename', () => {
    const serviceResponse = {
      found: Math.random() > 0.5,
      series: SERIES,
      volume: VOLUME,
      issueNumber: ISSUE_NUMBER,
      coverDate: COVER_DATE
    } as FilenameMetadataResponse;
    service
      .scrapeFilename({ filename: FILENAME })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(SCRAPE_FILENAME_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      filename: FILENAME
    } as FilenameMetadataRequest);
    req.flush(serviceResponse);
  });
});
