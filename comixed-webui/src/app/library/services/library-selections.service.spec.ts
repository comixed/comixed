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

import { LibrarySelectionsService } from './library-selections.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  CLEAR_COMIC_BOOK_SELECTIONS_URL,
  UPDATE_COMIC_BOOK_SELECTIONS_URL
} from '@app/library/library.constants';
import { SelectComicBooksRequest } from '@app/library/models/net/select-comic-books-request';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { HttpResponse } from '@angular/common/http';

describe('LibrarySelectionsService', () => {
  const IDS = [7, 17, 65, 1, 29.71, 3, 20, 96, 9, 21, 98, 4, 6];
  let service: LibrarySelectionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(LibrarySelectionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can select comic books', () => {
    service
      .updateComicBookSelections({ ids: IDS, adding: true })
      .subscribe(response => expect(response).toEqual(IDS));

    const req = httpMock.expectOne(
      interpolate(UPDATE_COMIC_BOOK_SELECTIONS_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: IDS,
      adding: true
    } as SelectComicBooksRequest);
    req.flush(IDS);
  });

  it('can deselect comic books', () => {
    service
      .updateComicBookSelections({ ids: IDS, adding: false })
      .subscribe(response => expect(response).toEqual(IDS));

    const req = httpMock.expectOne(
      interpolate(UPDATE_COMIC_BOOK_SELECTIONS_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: IDS,
      adding: false
    } as SelectComicBooksRequest);
    req.flush(IDS);
  });

  it('can clear all selections', () => {
    service
      .clearSelections()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(CLEAR_COMIC_BOOK_SELECTIONS_URL)
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({}));
  });
});
