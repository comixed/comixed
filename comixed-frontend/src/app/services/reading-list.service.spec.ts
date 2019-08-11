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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { TestBed } from '@angular/core/testing';
import { ReadingListService } from './reading-list.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ReadingList } from 'app/models/reading-list';
import { USER_READER } from 'app/user/models/user.fixtures';
import {
  CREATE_READING_LIST_URL,
  GET_READING_LISTS_URL,
  UPDATE_READING_LIST_URL
} from 'app/services/url.constants';
import { READING_LIST_1 } from 'app/models/reading-list.fixtures';
import { interpolate } from 'app/app.functions';

describe('ReadingListService', () => {
  const LIST_NAME = 'My reading list';
  const LIST_SUMMARY = 'My reading list summary';
  const READING_LIST: ReadingList = {
    id: 72,
    owner: USER_READER,
    name: LIST_NAME,
    summary: LIST_SUMMARY,
    entries: []
  };
  const READING_LISTS = [READING_LIST_1];

  let service: ReadingListService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReadingListService]
    });

    service = TestBed.get(ReadingListService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when getting all reading lists', () => {
    it('gets them from the server', () => {
      service.get_reading_lists().subscribe((result: Array<ReadingList>) => {
        expect(result).toEqual(READING_LISTS);
      });

      const req = http_mock.expectOne(GET_READING_LISTS_URL);
      expect(req.request.method).toEqual('GET');
      req.flush(READING_LISTS);
    });
  });

  describe('when saving a reading list', () => {
    it('posts the data', () => {
      service
        .save_reading_list({ ...READING_LIST, id: null, owner: null })
        .subscribe((result: ReadingList) => {
          expect(result).toEqual(READING_LIST);
        });

      const req = http_mock.expectOne(CREATE_READING_LIST_URL);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body.get('name')).toEqual(LIST_NAME);
      expect(req.request.body.get('summary')).toEqual(LIST_SUMMARY);
      expect(req.request.body.get('entries')).toEqual(
        `${READING_LIST.entries}`
      );

      req.flush(READING_LIST);
    });
  });

  describe('when updating a reading list', () => {
    it('puts the data', () => {
      service
        .save_reading_list(READING_LIST)
        .subscribe((result: ReadingList) => {
          expect(result).toBeTruthy();
        });

      const req = http_mock.expectOne(
        interpolate(UPDATE_READING_LIST_URL, { id: READING_LIST.id })
      );
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body.get('name')).toEqual(READING_LIST.name);
      expect(req.request.body.get('summary')).toEqual(READING_LIST.summary);
      expect(req.request.body.get('entries')).toEqual(
        `${READING_LIST.entries}`
      );

      req.flush(READING_LIST);
    });
  });
});
