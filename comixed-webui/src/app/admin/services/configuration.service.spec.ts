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
import { ConfigurationService } from './configuration.service';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  LOAD_CONFIGURATION_OPTIONS_URL,
  SAVE_CONFIGURATION_OPTIONS_URL
} from '@app/admin/admin.constants';
import { SaveConfigurationOptionsResponse } from '@app/admin/models/net/save-configuration-options-response';
import { SaveConfigurationOptionsRequest } from '@app/admin/models/net/save-configuration-options-request';

describe('ConfigurationService', () => {
  const OPTIONS = [
    CONFIGURATION_OPTION_1,
    CONFIGURATION_OPTION_2,
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];

  let service: ConfigurationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(ConfigurationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load all configuration options', () => {
    service.loadAll().subscribe(response => expect(response).toEqual(OPTIONS));

    const req = httpMock.expectOne(interpolate(LOAD_CONFIGURATION_OPTIONS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(OPTIONS);
  });

  it('can save configuration options', () => {
    service.saveOptions({ options: OPTIONS }).subscribe(response =>
      expect(response).toEqual({
        options: OPTIONS
      } as SaveConfigurationOptionsResponse)
    );

    const req = httpMock.expectOne(interpolate(SAVE_CONFIGURATION_OPTIONS_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      options: OPTIONS
    } as SaveConfigurationOptionsRequest);
    req.flush({ options: OPTIONS } as SaveConfigurationOptionsResponse);
  });
});
