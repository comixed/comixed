/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { MetricsService } from './metrics.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { METRIC_DETAIL, METRIC_LIST } from '@app/admin/admin.fixtures';
import { interpolate } from '@app/core';
import {
  LOAD_METRIC_DETAIL_URL,
  LOAD_METRIC_LIST_URL
} from '@app/admin/admin.constants';

describe('MetricsService', () => {
  let service: MetricsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(MetricsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the metric list', () => {
    service
      .loadMetricList()
      .subscribe(response => expect(response).toEqual(METRIC_LIST));

    const req = httpMock.expectOne(interpolate(LOAD_METRIC_LIST_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(METRIC_LIST);
  });

  it('can load the details for a metric', () => {
    service
      .loadMetricDetail({ name: METRIC_DETAIL.name })
      .subscribe(response => expect(response).toEqual(METRIC_DETAIL));

    const req = httpMock.expectOne(
      interpolate(LOAD_METRIC_DETAIL_URL, { name: METRIC_DETAIL.name })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(METRIC_DETAIL);
  });
});
