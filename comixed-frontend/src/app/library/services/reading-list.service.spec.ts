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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { TestBed } from '@angular/core/testing';

import { ReadingListService } from './reading-list.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { READING_LIST_1 } from 'app/library/models/reading-list/reading-list.fixtures';
import { interpolate } from 'app/app.functions';
import {
  GET_READING_LIST_URL,
  GET_READING_LISTS_URL,
  SAVE_READING_LIST_URL
} from 'app/app.constants';
import { SaveReadingListRequest } from 'app/library/models/net/save-reading-list-request';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('ReadingListService', () => {
  const READING_LISTS = [READING_LIST_1];

  let service: ReadingListService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerTestingModule],
      providers: [ReadingListService]
    });

    service = TestBed.get(ReadingListService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load reading lists', () => {
    service
      .get_all()
      .subscribe(response => expect(response).toEqual(READING_LISTS));

    const req = http_mock.expectOne(interpolate(GET_READING_LISTS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(READING_LISTS);
  });

  it('can get a single reading list', () => {
    service
      .get_reading_list(READING_LIST_1.id)
      .subscribe(response => expect(response).toEqual(READING_LIST_1));

    const req = http_mock.expectOne(
      interpolate(GET_READING_LIST_URL, { id: READING_LIST_1.id })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(READING_LIST_1);
  });

  it('can save a reading list', () => {
    service
      .save_reading_list(READING_LIST_1)
      .subscribe(response => expect(response).toEqual(READING_LIST_1));

    const req = http_mock.expectOne(
      interpolate(SAVE_READING_LIST_URL, { id: READING_LIST_1.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      name: READING_LIST_1.name,
      entries: READING_LIST_1.entries.map(entry => entry.comic.id),
      summary: READING_LIST_1.summary
    } as SaveReadingListRequest);
    req.flush(READING_LIST_1);
  });
});
