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

import { ServerRuntimeService } from './server-runtime.service';
import { LoggerModule } from '@angular-ru/logger';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  LOAD_SERVER_HEALTH_URL,
  SHUTDOWN_SERVER_URL
} from '@app/admin/admin.constants';
import { HttpResponse } from '@angular/common/http';
import { SERVER_HEALTH } from '@app/admin/admin.fixtures';

describe('ServerRuntimeService', () => {
  const HEALTH = SERVER_HEALTH;

  let service: ServerRuntimeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });
    service = TestBed.inject(ServerRuntimeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the server health', () => {
    service
      .loadServerHealth()
      .subscribe(response => expect(response).toEqual(HEALTH));

    const req = httpMock.expectOne(interpolate(LOAD_SERVER_HEALTH_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(HEALTH);
  });

  it('can initiate a shutdown', () => {
    service
      .shutdownServer()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(SHUTDOWN_SERVER_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });
});
