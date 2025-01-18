/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { ReadComicBooksService } from './read-comic-books.service';
import { interpolate } from '@app/core';
import {
  SET_COMIC_BOOK_READ_STATE_URL,
  SET_SELECTED_COMIC_BOOKS_READ_STATE_URL
} from '@app/user/user.constants';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { COMIC_DETAIL_4 } from '@app/comic-books/comic-books.fixtures';
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  READ_COMIC_BOOK_4,
  READ_COMIC_BOOK_5
} from '@app/user/user.fixtures';

describe('ReadComicBooksService', () => {
  const COMIC = COMIC_DETAIL_4;
  const READ_COUNT = Math.floor(Math.random() * 30000);
  const UNREAD_COUNT = Math.floor(Math.random() * 30000);
  const ENTRIES = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3,
    READ_COMIC_BOOK_4,
    READ_COMIC_BOOK_5
  ];

  let service: ReadComicBooksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ReadComicBooksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('marking a single comic book', () => {
    it('marks them as read', () => {
      service
        .setSingleReadState({ comicBookId: COMIC.comicId, read: true })
        .subscribe(response => expect(response.status).toEqual(200));

      const req = httpMock.expectOne(
        interpolate(SET_COMIC_BOOK_READ_STATE_URL, {
          comicBookId: COMIC.comicId
        })
      );
      expect(req.request.method).toEqual('PUT');
      req.flush(new HttpResponse({ status: 200 }));
    });

    it('marks them as unread', () => {
      service
        .setSingleReadState({ comicBookId: COMIC.comicId, read: false })
        .subscribe(response => expect(response.status).toEqual(200));

      const req = httpMock.expectOne(
        interpolate(SET_COMIC_BOOK_READ_STATE_URL, {
          comicBookId: COMIC.comicId
        })
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(new HttpResponse({ status: 200 }));
    });
  });

  describe('marking selected comic books', () => {
    it('marks them as read', () => {
      service
        .setSelectedReadState({ read: true })
        .subscribe(response => expect(response.status).toEqual(200));

      const req = httpMock.expectOne(
        interpolate(SET_SELECTED_COMIC_BOOKS_READ_STATE_URL)
      );
      expect(req.request.method).toEqual('PUT');
      req.flush(new HttpResponse({ status: 200 }));
    });

    it('marks them as unread', () => {
      service
        .setSelectedReadState({ read: false })
        .subscribe(response => expect(response.status).toEqual(200));

      const req = httpMock.expectOne(
        interpolate(SET_SELECTED_COMIC_BOOKS_READ_STATE_URL)
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(new HttpResponse({ status: 200 }));
    });
  });
});
