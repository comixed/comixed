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
import { ComicFileService } from './comic-file-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { interpolate } from '@app/app-functions';
import {
  LOAD_COMIC_FILES_FROM_SESSION_URL,
  LOAD_COMIC_FILES_URL,
  SEND_COMIC_FILES_URL,
  TOGGLE_COMIC_FILE_SELECTIONS_URL
} from '@app/library/library-constants';
import { COMIC_FILE_1 } from '@app/library/library-fixtures';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { ComicFileGroup } from '@app/library/models/comic-file-group';
import { ToggleComicFileSelectionRequest } from '@app/library/models/net/toggle-comic-file-selection-request';
import { LoadComicFilesResponse } from '@app/library/models/net/load-comic-files-response';

describe('ComicFileService', () => {
  const TEST_COMIC_FILE = COMIC_FILE_1;
  const TEST_PATH = '/Users/comixed/Library/Comics/import';
  const TEST_MAXIMUM_RECORDS = 100;
  const TEST_GROUPS: ComicFileGroup[] = [
    {
      directory: 'directory1',
      files: [TEST_COMIC_FILE]
    }
  ];

  let service: ComicFileService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(ComicFileService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loading comic files', () => {
    it('should load from the session', () => {
      const serverResponse = { groups: TEST_GROUPS } as LoadComicFilesResponse;

      service.loadFromSession().subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

      const req = httpController.expectOne(
        interpolate(LOAD_COMIC_FILES_FROM_SESSION_URL)
      );

      expect(req.request.method).toEqual('GET');
      req.flush(serverResponse);
      httpController.verify();
    });

    it('should load from the file system', async () => {
      const serverResponse = { groups: TEST_GROUPS } as LoadComicFilesResponse;

      service
        .loadFromDisk({
          directory: TEST_PATH,
          maximum: TEST_MAXIMUM_RECORDS
        })
        .subscribe({
          next: response => expect(response).toStrictEqual(serverResponse)
        });

      const req = httpController.expectOne(interpolate(LOAD_COMIC_FILES_URL));
      expect(req.request.method).toEqual('POST');
      req.flush(serverResponse);
      httpController.verify();
    });
  });

  it('should selected comic files', async () => {
    const serverResponse = { groups: TEST_GROUPS } as LoadComicFilesResponse;

    service
      .setComicFileSelected({
        filename: TEST_COMIC_FILE.filename,
        single: true,
        selected: true
      })
      .subscribe({
        next: response => expect(response).toStrictEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(TOGGLE_COMIC_FILE_SELECTIONS_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      filename: TEST_COMIC_FILE.filename,
      single: true,
      selected: true
    } as ToggleComicFileSelectionRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should import comics', async () => {
    service.import().subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(interpolate(SEND_COMIC_FILES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({} as unknown);
    req.flush(200);
    httpController.verify();
  });
});
