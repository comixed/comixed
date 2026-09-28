/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { HashSelectionService } from './hash-selection.service';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/comic-pages/comic-pages.fixtures';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  ADD_ALL_DUPLICATE_HASHES_SELECTION_URL,
  ADD_HASH_SELECTION_URL,
  CLEAR_HASH_SELECTION_URL,
  LOAD_HASH_SELECTIONS_URL,
  REMOVE_HASH_SELECTION_URL
} from '@app/comic-pages/comic-pages.constants';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

describe('HashSelectionService', () => {
  const HASHES = [PAGE_1.hash, PAGE_2.hash, PAGE_3.hash];
  const HASH = HASHES[0];

  let service: HashSelectionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(HashSelectionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load hash selections', () => {
    const serviceResponse = HASHES;

    service
      .loadSelections()
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_HASH_SELECTIONS_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serviceResponse);
  });

  it('can add all hash selections', () => {
    const serviceResponse = HASHES;

    service
      .selectAll()
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(ADD_ALL_DUPLICATE_HASHES_SELECTION_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(serviceResponse);
  });

  it('can add a hash selection', () => {
    const serviceResponse = HASHES;

    service
      .addSelection({ hash: HASH })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(ADD_HASH_SELECTION_URL, { hash: HASH })
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(serviceResponse);
  });

  it('can remove a hash selection', () => {
    const serviceResponse = HASHES;

    service
      .removeSelection({ hash: HASH })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(
      interpolate(REMOVE_HASH_SELECTION_URL, { hash: HASH })
    );
    expect(req.request.method).toEqual('PUT');
    req.flush(serviceResponse);
  });

  it('can clear the hash selections', () => {
    const serviceResponse = HASHES;

    service
      .clearSelections()
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(CLEAR_HASH_SELECTION_URL));
    expect(req.request.method).toEqual('DELETE');
    req.flush(serviceResponse);
  });
});
