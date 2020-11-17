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
import { ApiResponse, interpolate } from '@app/core';
import { SessionUpdateResponse } from '@app/models/net/session-update-response';
import { SessionUpdateRequest } from '@app/models/net/session-update-request';
import { LOAD_SESSION_UPDATE_URL } from '@app/app.constants';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), HttpClientTestingModule]
    });

    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load user session updates', () => {
    const serviceResponse = { success: true } as ApiResponse<
      SessionUpdateResponse
    >;
    service
      .loadSessionUpdate({ reset: false, timeout: 1000 })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_SESSION_UPDATE_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      reset: false,
      timeout: 1000
    } as SessionUpdateRequest);
    req.flush(serviceResponse);
  });
});