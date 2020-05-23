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

import {TestBed} from '@angular/core/testing';

import {ReadingListService} from './reading-list.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import {interpolate} from 'app/app.functions';
import {SaveReadingListRequest} from 'app/library/models/net/save-reading-list-request';
import {LoggerModule} from '@angular-ru/logger';
import {
  CREATE_READING_LIST_URL,
  UPDATE_READING_LIST_URL
} from 'app/library/library.constants';
import {READING_LIST_1} from 'app/comics/models/reading-list.fixtures';

describe('ReadingListService', () => {
  const READING_LIST = READING_LIST_1;
  const READING_LIST_ID = READING_LIST.id;
  const READING_LIST_NAME = READING_LIST.name;
  const READING_LIST_SUMMARY = READING_LIST.summary;

  let service: ReadingListService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [ReadingListService]
    });

    service = TestBed.get(ReadingListService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can save a reading list', () => {
    service
        .save(null, READING_LIST_NAME, READING_LIST_SUMMARY)
        .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = http_mock.expectOne(interpolate(CREATE_READING_LIST_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      name: READING_LIST_NAME,
      summary: READING_LIST_SUMMARY
    } as SaveReadingListRequest);
    req.flush(READING_LIST);
  });

  it('can update a reading list', () => {
    service
        .save(READING_LIST_ID, READING_LIST_NAME, READING_LIST_SUMMARY)
        .subscribe(response => expect(response).toEqual(READING_LIST));

    const req = http_mock.expectOne(
        interpolate(UPDATE_READING_LIST_URL, {id: READING_LIST_ID})
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      name: READING_LIST_NAME,
      summary: READING_LIST_SUMMARY
    } as SaveReadingListRequest);
    req.flush(READING_LIST);
  });
});
