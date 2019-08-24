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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';

import { ImportService } from './import.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/library/models/comic-file.fixtures';
import { interpolate } from 'app/app.functions';
import { GET_COMIC_FILES_URL, IMPORT_COMIC_FILES_URL } from 'app/app.constants';

describe('ImportService', () => {
  const DIRECTORY = '/Users/comixed/Documents/comics';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let service: ImportService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImportService]
    });

    service = TestBed.get(ImportService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get comic files', () => {
    service.get_comic_files(DIRECTORY).subscribe(response => {
      expect(response).toEqual(COMIC_FILES);
    });

    const req = http_mock.expectOne(
      interpolate(GET_COMIC_FILES_URL, { directory: encodeURI(DIRECTORY) })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(COMIC_FILES);
  });

  it('can start importing comic files', () => {
    service
      .import_comic_files(COMIC_FILES, false, true)
      .subscribe((response: number) => {
        expect(response).toEqual(29);

        const req = http_mock.expectOne(interpolate(IMPORT_COMIC_FILES_URL));
        expect(req.request.method).toEqual('POST');
        expect(req.request.body['filenames']).toEqual(COMIC_FILES);
        expect(req.request.body['delete_blocked_pages']).toBeFalsy();
        expect(req.request.body['ignore_metadata']).toBeTruthy();
        req.flush(29);
      });
  });
});
