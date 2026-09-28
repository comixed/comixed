/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { ConfigurationService } from './configuration-service';
import {
  TEST_CONFIGURATION_OPTIONS_1,
  TEST_CONFIGURATION_OPTIONS_2
} from '@app/settings/settings-fixtures';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import {
  LOAD_CONFIGURATION_URL,
  SAVE_CONFIGURATION_URL
} from '@app/settings/settings-constants';
import { interpolate } from '@app/app-functions';
import { SaveConfigurationRequest } from '@app/settings/models/net/save-configuration-request';

describe('ConfigurationService', () => {
  const TEST_CONFIGURATION_OPTION_LIST = [
    TEST_CONFIGURATION_OPTIONS_1,
    TEST_CONFIGURATION_OPTIONS_2
  ];

  let service: ConfigurationService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(ConfigurationService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the configuration', () => {
    const serverResponse = TEST_CONFIGURATION_OPTION_LIST;

    service.load().subscribe({
      next: response =>
        expect(response).toStrictEqual(TEST_CONFIGURATION_OPTION_LIST)
    });

    const req = httpController.expectOne(interpolate(LOAD_CONFIGURATION_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should save the configuration', () => {
    const serverResponse = TEST_CONFIGURATION_OPTION_LIST;

    service.save({ options: TEST_CONFIGURATION_OPTION_LIST }).subscribe({
      next: response =>
        expect(response).toStrictEqual(TEST_CONFIGURATION_OPTION_LIST)
    });

    const req = httpController.expectOne(interpolate(SAVE_CONFIGURATION_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      options: TEST_CONFIGURATION_OPTION_LIST
    } as SaveConfigurationRequest);
    req.flush(serverResponse);
    httpController.verify();
  });
});
