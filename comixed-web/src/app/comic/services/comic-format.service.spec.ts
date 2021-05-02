/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { ComicFormatService } from './comic-format.service';
import { LoggerModule } from '@angular-ru/logger';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { FORMAT_1, FORMAT_3, FORMAT_5 } from '@app/comic/comic.fixtures';
import { interpolate } from '@app/core';
import { LOAD_COMIC_FORMATS_URL } from '@app/comic/comic.constants';

describe('ComicFormatService', () => {
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];

  let service: ComicFormatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ComicFormatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load comic formats', () => {
    service
      .loadFormats()
      .subscribe(response => expect(response).toEqual(FORMATS));

    const req = httpMock.expectOne(interpolate(LOAD_COMIC_FORMATS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(FORMATS);
  });
});
