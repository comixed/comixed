/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { StoryService } from './story.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';
import { interpolate } from '@app/core';
import {
  LOAD_ALL_STORY_NAMES_URL,
  LOAD_STORIES_FOR_NAME_URL
} from '@app/lists/lists.constants';

describe('StoryService', () => {
  const ENTRIES = [STORY_1, STORY_2, STORY_3];
  const NAMES = ENTRIES.map(story => story.name);

  let service: StoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()]
    });
    service = TestBed.inject(StoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get the set of story names', () => {
    service
      .loadAllNames()
      .subscribe(response => expect(response).toEqual(NAMES));

    const req = httpMock.expectOne(interpolate(LOAD_ALL_STORY_NAMES_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(NAMES);
  });

  it('can get the set of story names', () => {
    service
      .loadForName({ name: NAMES[0] })
      .subscribe(response => expect(response).toEqual(ENTRIES));

    const req = httpMock.expectOne(
      interpolate(LOAD_STORIES_FOR_NAME_URL, { name: NAMES[0] })
    );
    expect(req.request.method).toEqual('GET');
    req.flush(ENTRIES);
  });
});
