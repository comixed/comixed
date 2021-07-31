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
import { BuildDetailsService } from './build-details.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { BUILD_DETAILS } from '@app/app.fixtures';
import { LOAD_BUILD_DETAILS_URL } from '@app/app.constants';
import { interpolate } from '@app/core';

describe('ServerStatusService', () => {
  let service: BuildDetailsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(BuildDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads build details', () => {
    service
      .loadDetails()
      .subscribe(response => expect(response).toEqual(BUILD_DETAILS));

    const req = httpMock.expectOne(interpolate(LOAD_BUILD_DETAILS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(BUILD_DETAILS);
  });
});
