/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { SeriesService } from './series.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoadSeriesListResponse } from '@app/collections/models/net/load-series-list-response';
import {
  ISSUE_1,
  ISSUE_2,
  ISSUE_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';
import { interpolate } from '@app/core';
import {
  LOAD_SERIES_DETAIL_URL,
  LOAD_SERIES_URL
} from '@app/collections/collections.constants';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { LoadSeriesDetailRequest } from '@app/collections/models/net/load-series-detail-request';

describe('SeriesService', () => {
  const SERIES_LIST = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];
  const SERIES_DETAIL = [ISSUE_1, ISSUE_2, ISSUE_3];
  const PUBLISHER = 'The publisher';
  const SERIES = 'The series';
  const VOLUME = '2022';

  let service: SeriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), HttpClientTestingModule]
    });

    service = TestBed.inject(SeriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load series', () => {
    const serviceResponse = { series: SERIES_LIST } as LoadSeriesListResponse;
    service
      .loadSeries()
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_SERIES_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(serviceResponse);
  });

  it('can load series details', () => {
    const serviceResponse = SERIES_DETAIL;
    service
      .loadSeriesDetail({
        publisher: PUBLISHER,
        name: SERIES,
        volume: VOLUME
      })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_SERIES_DETAIL_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      publisher: PUBLISHER,
      name: SERIES,
      volume: VOLUME
    } as LoadSeriesDetailRequest);
    req.flush(serviceResponse);
  });
});
