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
import { PluginLanguageService } from './plugin-language.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { PLUGIN_LANGUAGE_LIST } from '@app/library-plugins/library-plugins.fixtures';
import { interpolate } from '@app/core';
import { LOAD_LANGUAGE_RUNTIME_LIST_URL } from '@app/library-plugins/library-plugins.constants';

describe('PluginLanguageService', () => {
  let service: PluginLanguageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(PluginLanguageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the list of language runtimes', () => {
    service
      .loadLanguageRuntimes()
      .subscribe(response => expect(response).toEqual(PLUGIN_LANGUAGE_LIST));

    const req = httpMock.expectOne(interpolate(LOAD_LANGUAGE_RUNTIME_LIST_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(PLUGIN_LANGUAGE_LIST);
  });
});
