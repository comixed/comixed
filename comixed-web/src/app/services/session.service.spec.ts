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

import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { interpolate } from '@app/core';
import { SessionUpdateRequest } from '@app/models/net/session-update-request';
import { LOAD_SESSION_UPDATE_URL } from '@app/app.constants';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { SessionUpdateResponse } from '@app/models/net/session-update-response';
import { COMIC_2, COMIC_3 } from '@app/library/library.fixtures';
import { TaskCountService } from '@app/services/task-count.service';

describe('SessionService', () => {
  const TIMESTAMP = new Date().getTime();
  const MAXIMUM_RECORDS = 100;
  const TIMEOUT = 300;
  const IMPORT_COUNT = 717;
  const UPDATED_COMICS = [COMIC_2];
  const REMOVED_COMICS = [COMIC_3];

  let service: SessionService;
  let httpMock: HttpTestingController;
  let taskCountService: jasmine.SpyObj<TaskCountService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), HttpClientTestingModule],
      providers: [
        {
          provide: TaskCountService,
          useValue: {
            start: jasmine.createSpy('ImportCountService.start()'),
            stop: jasmine.createSpy('ImportCountService.stop()')
          }
        }
      ]
    });

    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    taskCountService = TestBed.inject(
      TaskCountService
    ) as jasmine.SpyObj<TaskCountService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load user session updates', () => {
    const serviceResponse = {
      update: {
        importCount: IMPORT_COUNT,
        updatedComics: UPDATED_COMICS,
        removedComicIds: REMOVED_COMICS.map(comic => comic.id)
      }
    } as SessionUpdateResponse;
    service
      .loadSessionUpdate({
        timestamp: TIMESTAMP,
        maximumRecords: MAXIMUM_RECORDS,
        timeout: TIMEOUT
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_SESSION_UPDATE_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      timestamp: TIMESTAMP,
      maximumRecords: MAXIMUM_RECORDS,
      timeout: TIMEOUT
    } as SessionUpdateRequest);
    req.flush(serviceResponse);
  });
});
