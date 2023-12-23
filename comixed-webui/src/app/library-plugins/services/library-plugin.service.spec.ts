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
import { LibraryPluginService } from './library-plugin.service';
import {
  LIBRARY_PLUGIN_4,
  PLUGIN_LIST
} from '@app/library-plugins/library-plugins.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/core';
import {
  CREATE_PLUGIN_URL,
  DELETE_PLUGIN_URL,
  LOAD_ALL_PLUGINS_URL,
  UPDATE_PLUGIN_URL
} from '@app/library-plugins/library-plugins.constants';
import { CreatePluginRequest } from '@app/library-plugins/models/net/create-plugin-request';
import { UpdatePluginRequest } from '@app/library-plugins/models/net/update-plugin-request';
import { HttpResponse } from '@angular/common/http';

describe('LibraryPluginService', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;

  let service: LibraryPluginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });

    service = TestBed.inject(LibraryPluginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the list of plugins', () => {
    service
      .loadAll()
      .subscribe(response => expect(response).toEqual(PLUGIN_LIST));

    const req = httpMock.expectOne(interpolate(LOAD_ALL_PLUGINS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(PLUGIN_LIST);
  });

  it('can create a new plugin', () => {
    service
      .createPlugin({
        language: PLUGIN.language,
        filename: PLUGIN.filename
      })
      .subscribe(response => expect(response).toEqual(PLUGIN));

    const req = httpMock.expectOne(interpolate(CREATE_PLUGIN_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      language: PLUGIN.language,
      filename: PLUGIN.filename
    } as CreatePluginRequest);
    req.flush(PLUGIN);
  });

  it('can update a plugin', () => {
    service
      .updatePlugin({
        plugin: PLUGIN
      })
      .subscribe(response => expect(response).toEqual(PLUGIN));

    const properties = new Map(
      PLUGIN.properties.map(entry => [entry.name, entry.value])
    );
    const req = httpMock.expectOne(
      interpolate(UPDATE_PLUGIN_URL, { pluginId: PLUGIN.id })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      adminOnly: PLUGIN.adminOnly,
      properties
    } as UpdatePluginRequest);
    req.flush(PLUGIN);
  });

  it('can delete a plugin', () => {
    service
      .deletePlugin({
        plugin: PLUGIN
      })
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(
      interpolate(DELETE_PLUGIN_URL, { pluginId: PLUGIN.id })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(new HttpResponse({ status: 200 }));
  });
});
