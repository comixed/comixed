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
import { ReadComicService } from './read-comic-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { interpolate } from '@app/app-functions';
import { of } from 'rxjs';
import {
  MARK_SELECTED_COMICS_READ_STATE_URL,
  UNMARK_SELECTED_COMICS_READ_STATE_URL
} from '@app/account/account-constants';

describe('ReadComicService', () => {
  let service: ReadComicService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(ReadComicService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should mark selected comics as read', () => {
    service
      .markSelectedComics({ readState: true })
      .subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(
      interpolate(MARK_SELECTED_COMICS_READ_STATE_URL)
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({} as unknown);
    req.flush(of(undefined));
    httpController.verify();
  });

  it('should unmark selected comics as read', () => {
    service
      .markSelectedComics({ readState: false })
      .subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(
      interpolate(UNMARK_SELECTED_COMICS_READ_STATE_URL)
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(of(undefined));
    httpController.verify();
  });
});
