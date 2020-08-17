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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { TestBed } from '@angular/core/testing';

import { BuildDetailsService } from './build-details.service';
import { BUILD_DETAILS_1 } from 'app/backend-status/models/build-details.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import { GET_BUILD_DETAILS_URL } from 'app/app.constants';

describe('BuildDetailsService', () => {
  let service: BuildDetailsService;
  let http_mock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BuildDetailsService]
    });

    service = TestBed.get(BuildDetailsService);
    http_mock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get the build details', () => {
    service
      .getBuildDetails()
      .subscribe(response => expect(response).toEqual(BUILD_DETAILS_1));

    const req = http_mock.expectOne(interpolate(GET_BUILD_DETAILS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(BUILD_DETAILS_1);
  });
});
