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
import { TitleService } from './title-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';

describe('TitleService', () => {
  const TEST_TITLE = 'The Page Title';
  const TEST_TITLE_TRANSLATED = 'The Page Title Translated';

  let service: TitleService;
  let title: Title;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        TranslateService
      ]
    });

    service = TestBed.inject(TitleService);
    title = TestBed.inject(Title);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the page title', () => {
    vi.spyOn(translateService, 'instant').mockReturnValue(
      TEST_TITLE_TRANSLATED
    );
    const setTitleSpy = vi.spyOn(title, 'setTitle');
    service.setTitle(TEST_TITLE);
    expect(setTitleSpy).toHaveBeenCalledWith(TEST_TITLE_TRANSLATED);
  });
});
