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
import { TitleService } from './title.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

describe('TitleService', () => {
  const TITLE_TEXT = 'The Page Title';

  let service: TitleService;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()]
    });

    service = TestBed.inject(TitleService);
    title = TestBed.inject(Title);
    spyOn(title, 'setTitle');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setting the page title', () => {
    beforeEach(() => {
      service.setTitle(TITLE_TEXT);
    });

    it('sets the title in Angular', () => {
      expect(title.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
