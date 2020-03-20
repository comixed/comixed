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

import { PublisherService } from './publisher.service';
import { PUBLISHER_1 } from 'app/library/models/publisher.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import { GET_PUBLISHER_BY_NAME_URL } from 'app/library/library.constants';
import { LoggerModule } from '@angular-ru/logger';

describe('PublisherService', () => {
  const PUBLISHER = PUBLISHER_1;
  const PUBLISHER_NAME = PUBLISHER.name;

  let service: PublisherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), HttpClientTestingModule],
      providers: [PublisherService]
    });

    service = TestBed.get(PublisherService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get a publisher by name', () => {
    service
      .getPublisherByName(PUBLISHER_NAME)
      .subscribe(response => expect(response).toEqual(PUBLISHER));

    const req = httpMock.expectOne(
      interpolate(GET_PUBLISHER_BY_NAME_URL, { name: PUBLISHER_NAME })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(PUBLISHER);
  });
});
