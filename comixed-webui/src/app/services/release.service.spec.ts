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
import { ReleaseService } from './release.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { CURRENT_RELEASE, LATEST_RELEASE } from '@app/app.fixtures';
import {
  LOAD_CURRENT_RELEASE_DETAILS_URL,
  LOAD_LATEST_RELEASE_DETAILS_URL
} from '@app/app.constants';
import { interpolate } from '@app/core';

describe('ReleaseService', () => {
  let service: ReleaseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ReleaseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads the current release details', () => {
    service
      .loadCurrentReleaseDetails()
      .subscribe(response => expect(response).toEqual(CURRENT_RELEASE));

    const req = httpMock.expectOne(
      interpolate(LOAD_CURRENT_RELEASE_DETAILS_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(CURRENT_RELEASE);
  });

  it('loads the latest release details', () => {
    service
      .loadLatestReleaseDetails()
      .subscribe(response => expect(response).toEqual(LATEST_RELEASE));

    const req = httpMock.expectOne(
      interpolate(LOAD_LATEST_RELEASE_DETAILS_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(LATEST_RELEASE);
  });
});
