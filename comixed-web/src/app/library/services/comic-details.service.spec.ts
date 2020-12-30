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

import { ComicDetailsService } from '@app/library/services/comic-details.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoggerModule } from '@angular-ru/logger';
import { COMIC_1 } from '@app/library/library.fixtures';
import { HttpResponse } from '@angular/common/http';
import { interpolate } from '@app/core';
import { SAVE_COMIC_URL } from '@app/library/library.constants';

describe('ComicDetailsService', () => {
  let service: ComicDetailsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ComicDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can save details comic', () => {
    const serviceResponse = new HttpResponse({ status: 200 });
    service
      .saveComic(COMIC_1)
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(SAVE_COMIC_URL, { id: COMIC_1.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(COMIC_1);
    req.flush(serviceResponse);
  });
});
