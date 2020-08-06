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

import { PluginService } from './plugin.service';
import { PLUGIN_DESCRIPTOR_1 } from 'app/library/models/plugin-descriptor.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from 'app/app.functions';
import {
  GET_ALL_PLUGINS_URL,
  RELOAD_PLUGINS_URL
} from 'app/library/library.constants';
import { LoggerModule } from '@angular-ru/logger';

describe('PluginService', () => {
  const PLUGINS = [PLUGIN_DESCRIPTOR_1];

  let pluginService: PluginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [PluginService]
    });

    pluginService = TestBed.get(PluginService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(pluginService).toBeTruthy();
  });

  it('can get the list of plugins', () => {
    pluginService
      .getAllPlugins()
      .subscribe(response => expect(response).toEqual(PLUGINS));

    const req = httpMock.expectOne(interpolate(GET_ALL_PLUGINS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(PLUGINS);
  });

  it('can reload the list of plugins', () => {
    pluginService
      .reloadPlugins()
      .subscribe(response => expect(response).toEqual(PLUGINS));

    const req = httpMock.expectOne(interpolate(RELOAD_PLUGINS_URL));
    expect(req.request.method).toEqual('POST');
    req.flush(PLUGINS);
  });
});
