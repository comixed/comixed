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
import { ReadingListService } from './reading-list.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';
import { interpolate } from '@app/core';
import {
  ADD_COMICS_TO_READING_LIST_URL,
  LOAD_READING_LIST_URL,
  LOAD_READING_LISTS_URL,
  REMOVE_COMICS_FROM_READING_LIST_URL,
  SAVE_READING_LIST,
  UPDATE_READING_LIST
} from '@app/lists/lists.constants';
import { LoggerModule } from '@angular-ru/logger';
import { COMIC_1 } from '@app/comic-book/comic-book.fixtures';
import { AddComicsToReadingListRequest } from '@app/lists/models/net/add-comics-to-reading-list-request';
import { RemoveComicsFromReadingListRequest } from '@app/lists/models/net/remove-comics-from-reading-list-request';

describe('ReadingListService', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];
  const READING_LIST = READING_LISTS[0];
  const COMIC = COMIC_1;

  let service: ReadingListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ReadingListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the reading lists for the current user', () => {
    service
      .loadEntries()
      .subscribe(response => expect(response).toEqual(READING_LISTS));

    const req = httpMock.expectOne(interpolate(LOAD_READING_LISTS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(READING_LISTS);
  });

  it('can load a single reading list', () => {
    service
      .loadOne({ id: READING_LIST.id })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(LOAD_READING_LIST_URL, {
        id: READING_LIST.id
      })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(READING_LIST);
  });

  it('can save a new reading list', () => {
    service
      .save({ list: { ...READING_LIST, id: null } })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(interpolate(SAVE_READING_LIST));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ ...READING_LIST, id: null });
    req.flush(READING_LIST);
  });

  it('can update an existing reading list', () => {
    service
      .save({ list: READING_LIST })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(UPDATE_READING_LIST, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(READING_LIST);
    req.flush(READING_LIST);
  });

  it('can add comics to a reading list', () => {
    service
      .addComics({
        list: READING_LIST,
        comics: [COMIC]
      })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(ADD_COMICS_TO_READING_LIST_URL, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [COMIC.id]
    } as AddComicsToReadingListRequest);
    req.flush(READING_LIST);
  });

  it('can remove comics from a reading list', () => {
    service
      .removeComics({
        list: READING_LIST,
        comics: [COMIC]
      })
      .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = httpMock.expectOne(
      interpolate(REMOVE_COMICS_FROM_READING_LIST_URL, { id: READING_LIST.id })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      ids: [COMIC.id]
    } as RemoveComicsFromReadingListRequest);
    req.flush(READING_LIST);
  });
});
