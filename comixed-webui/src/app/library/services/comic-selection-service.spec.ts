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
import { ComicSelectionService } from './comic-selection-service';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { interpolate } from '@app/app-functions';
import {
  CLEAR_COMIC_SELECTIONS_URL,
  DESELECT_SINGLE_COMIC_URL,
  LOAD_SELECTED_COMIC_ID_LIST_URL,
  SELECT_SINGLE_COMIC_URL,
  SET_SELECTED_BY_FILTER_URL,
  SET_SELECTED_BY_READ_STATE_URL
} from '@app/library/library-constants';
import { of } from 'rxjs';
import { COMIC_1 } from '@app/library/library-fixtures';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { SetSelectedByReadStateRequest } from '@app/library/models/net/set-selected-by-read-state-request';
import { MultipleComicSelectionRequest } from '@app/library/models/net/multiple-comic-selection-request';
import { ArchiveType } from '@app/library/models/archive-type';
import { ComicType } from '@app/library/models/comic-type';
import { ComicState } from '@app/library/models/comic-state';

describe('ComicSelectionService', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_COMIC_ID_LIST = [1, 3, 5, 6, 7, 89];
  const TEST_COVER_MONTH = 7;
  const TEST_COVER_YEAR = 1965;
  const TEST_ARCHIVE_TYPE = ArchiveType.CB7;
  const TEST_COMIC_STATE = ComicState.DISCOVERED;
  const TEST_COMIC_TYPE = ComicType.ISSUE;
  const TEST_SEARCH_TEXT = 'Some search text';
  const TEST_UNSCRAPED_STATE = Math.random() > 0.5;
  const TEST_SELECTED = Math.random() > 0.5;

  let service: ComicSelectionService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideLogger({ minLevel: LoggerLevel.OFF })
      ]
    });

    service = TestBed.inject(ComicSelectionService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

  it('should clear the selections', () => {
    service
      .clearSelections()
      .subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(
      interpolate(CLEAR_COMIC_SELECTIONS_URL)
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(of(undefined));
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

  describe('selecting by read state', () => {
    it('should set the selected state for read comics', () => {
      service
        .setSelectedByReadState({
          readState: true,
          selected: true
        })
        .subscribe({ next: () => expect(true).toBeTruthy() });

      const req = httpController.expectOne(
        interpolate(SET_SELECTED_BY_READ_STATE_URL)
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        unreadOnly: false,
        selected: true
      } as SetSelectedByReadStateRequest);
      req.flush(of(undefined));
      httpController.verify();
    });

    it('should clear the selected state for read comics', () => {
      service
        .setSelectedByReadState({
          readState: true,
          selected: false
        })
        .subscribe({ next: () => expect(true).toBeTruthy() });

      const req = httpController.expectOne(
        interpolate(SET_SELECTED_BY_READ_STATE_URL)
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        unreadOnly: false,
        selected: false
      } as SetSelectedByReadStateRequest);
      req.flush(of(undefined));
      httpController.verify();
    });

    it('should set the selected state for unread comics', () => {
      service
        .setSelectedByReadState({
          readState: false,
          selected: true
        })
        .subscribe({ next: () => expect(true).toBeTruthy() });

      const req = httpController.expectOne(
        interpolate(SET_SELECTED_BY_READ_STATE_URL)
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        unreadOnly: true,
        selected: true
      } as SetSelectedByReadStateRequest);
      req.flush(of(undefined));
      httpController.verify();
    });

    it('should set the selected state by filter', () => {
      service
        .setSelectedByFilter({
          coverYear: TEST_COVER_YEAR,
          coverMonth: TEST_COVER_MONTH,
          archiveType: TEST_ARCHIVE_TYPE,
          comicType: TEST_COMIC_TYPE,
          comicState: TEST_COMIC_STATE,
          unscrapedState: TEST_UNSCRAPED_STATE,
          searchText: TEST_SEARCH_TEXT,
          selected: TEST_SELECTED
        })
        .subscribe({ next: () => expect(true).toBeTruthy() });

      const req = httpController.expectOne(
        interpolate(SET_SELECTED_BY_FILTER_URL)
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        coverYear: TEST_COVER_YEAR,
        coverMonth: TEST_COVER_MONTH,
        archiveType: TEST_ARCHIVE_TYPE,
        comicType: TEST_COMIC_TYPE,
        comicState: TEST_COMIC_STATE,
        unscrapedState: TEST_UNSCRAPED_STATE,
        searchText: TEST_SEARCH_TEXT,
        selected: TEST_SELECTED
      } as MultipleComicSelectionRequest);
      req.flush(of(undefined));
      httpController.verify();
    });
  });

  it('should clear the selected state for unread comics', () => {
    service
      .setSelectedByReadState({
        readState: false,
        selected: false
      })
      .subscribe({ next: () => expect(true).toBeTruthy() });

    const req = httpController.expectOne(
      interpolate(SET_SELECTED_BY_READ_STATE_URL)
    );
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      unreadOnly: true,
      selected: false
    } as SetSelectedByReadStateRequest);
    req.flush(of(undefined));
    httpController.verify();
  });
});
