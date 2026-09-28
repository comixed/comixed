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
import { ComicService } from './comic-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { LoadComicDetailResponse } from '@app/library/models/net/load-comic-detail-response';
import {
  COMIC_1,
  COMIC_PAGE_1,
  COMIC_TAG_1,
  METADATA_1
} from '@app/library/library-fixtures';
import {
  DESELECT_SINGLE_COMIC_URL,
  LOAD_COMIC_URL,
  LOAD_SELECTED_COMIC_ID_LIST_URL,
  SELECT_SINGLE_COMIC_URL,
  UPDATE_COMIC_URL
} from '@app/library/library-constants';
import { interpolate } from '@app/app-functions';
import { UpdateComicRequest } from '@app/library/models/net/update-comic-request';
import { of } from 'rxjs';

describe('ComicService', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_PAGES = [COMIC_PAGE_1];
  const TEST_TAGS = [COMIC_TAG_1];
  const TEST_METADATA = METADATA_1;
  const TEST_COMIC_ID_LIST = [1, 3, 5, 6, 7, 89];

  let service: ComicService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(ComicService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load a comic', () => {
    const serverResponse = {
      detail: TEST_COMIC,
      pages: TEST_PAGES,
      tags: TEST_TAGS,
      metadata: TEST_METADATA
    } as LoadComicDetailResponse;

    service.load({ comicId: TEST_COMIC.comicId }).subscribe({
      next: response => expect(response).toBe(serverResponse)
    });

    const req = httpController.expectOne(
      interpolate(LOAD_COMIC_URL, { comicId: TEST_COMIC.comicId })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should update a comic', () => {
    const serverResponse = {
      detail: TEST_COMIC,
      pages: TEST_PAGES,
      tags: TEST_TAGS,
      metadata: TEST_METADATA
    } as LoadComicDetailResponse;
    service
      .save({
        comicId: TEST_COMIC.comicId,
        comicType: TEST_COMIC.comicType,
        publisher: TEST_COMIC.publisher,
        series: TEST_COMIC.series,
        volume: TEST_COMIC.volume,
        issueNumber: TEST_COMIC.issueNumber,
        imprint: TEST_COMIC.imprint,
        sortName: TEST_COMIC.sortName,
        title: TEST_COMIC.title,
        coverDate: TEST_COMIC.coverDate,
        storeDate: TEST_COMIC.storeDate
      })
      .subscribe({
        next: response => expect(response).toEqual(serverResponse)
      });

    const req = httpController.expectOne(
      interpolate(UPDATE_COMIC_URL, { id: TEST_COMIC.comicId })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      comicType: TEST_COMIC.comicType,
      publisher: TEST_COMIC.publisher,
      series: TEST_COMIC.series,
      volume: TEST_COMIC.volume,
      issueNumber: TEST_COMIC.issueNumber,
      imprint: TEST_COMIC.imprint,
      sortName: TEST_COMIC.sortName,
      title: TEST_COMIC.title,
      coverDate: TEST_COMIC.coverDate,
      storeDate: TEST_COMIC.storeDate
    } as UpdateComicRequest);
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should load the select comic id list', () => {
    const serverResponse = TEST_COMIC_ID_LIST;

    service.loadSelectComicIds().subscribe({
      next: response => expect(response).toStrictEqual(TEST_COMIC_ID_LIST)
    });

    const req = httpController.expectOne(
      interpolate(LOAD_SELECTED_COMIC_ID_LIST_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
    httpController.verify();
  });

  it('should select a single comic', () => {
    service
      .singleComicSelection({
        comic: TEST_COMIC,
        selected: true
      })
      .subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(
      interpolate(SELECT_SINGLE_COMIC_URL, {
        comicId: TEST_COMIC.comicId
      })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({} as unknown);
    req.flush(of(undefined));
    httpController.verify();
  });

  it('should deselect a single comic', () => {
    service
      .singleComicSelection({
        comic: TEST_COMIC,
        selected: false
      })
      .subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(
      interpolate(DESELECT_SINGLE_COMIC_URL, {
        comicId: TEST_COMIC.comicId
      })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(of(undefined));
    httpController.verify();
  });
});
