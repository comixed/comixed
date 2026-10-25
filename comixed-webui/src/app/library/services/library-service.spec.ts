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
import { LibraryService } from './library-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import { REMOTE_LIBRARY } from '@app/library/library-fixtures';
import { LOAD_LIBRARY_STATE_URL } from '@app/library/library-constants';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import {
  initialRemoteLibraryState,
  REMOTE_LIBRARY_FEATURE_KEY
} from '@app/library/reducers/remote-library.reducer';

describe('LibraryService', () => {
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [REMOTE_LIBRARY_FEATURE_KEY]: initialRemoteLibraryState
  };
  const TEST_REMOTE_LIBRARY = REMOTE_LIBRARY;

  let service: LibraryService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideMockStore({ initialState })
      ]
    });

    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the library state', () => {
    const serverResponse = TEST_REMOTE_LIBRARY;

    service.loadState().subscribe({
      next: response => expect(response).toStrictEqual(serverResponse)
    });

    const req = httpController.expectOne(interpolate(LOAD_LIBRARY_STATE_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });
});
