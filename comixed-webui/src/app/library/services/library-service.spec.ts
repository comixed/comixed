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
import { LibraryStore } from '@app/library/stores/library-store';
import { REMOTE_LIBRARY_STATE } from '@app/library/library-fixtures';
import { LOAD_LIBRARY_STATE_URL } from '@app/library/library-constants';

describe('LibraryService', () => {
  const TEST_LIBRARY_STATE = REMOTE_LIBRARY_STATE;

  let service: LibraryService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideHttpClient(),
        provideHttpClientTesting(),
        LibraryStore
      ]
    });

    httpController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(LibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loading the library state', () => {
    it('success', async () => {
      const updateStateSpy = vi.spyOn(service.libraryStore, 'updateState');
      await service.loadLibraryState();
      const req = httpController.expectOne(interpolate(LOAD_LIBRARY_STATE_URL));
      expect(req.request.method).toEqual('GET');
      req.flush(TEST_LIBRARY_STATE);
      httpController.verify();
      expect(updateStateSpy).toHaveBeenCalledWith(TEST_LIBRARY_STATE);
    });
  });
});
