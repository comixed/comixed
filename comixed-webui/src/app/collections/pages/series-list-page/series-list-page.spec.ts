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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesListPage } from './series-list-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { CollectionService } from '@app/collections/services/collection-service';
import { beforeEach, Mock } from 'vitest';
import { provideRouter } from '@angular/router';

describe('SeriesListPage', () => {
  const TEST_TITLE_TRANSLATED = 'The translated title';

  let component: SeriesListPage;
  let fixture: ComponentFixture<SeriesListPage>;
  let loadSeriesSpy: unknown;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesListPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        CollectionService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesListPage);
    component = fixture.componentInstance;
    loadSeriesSpy = vi.spyOn(
      TestBed.inject(CollectionService),
      'loadSeriesList'
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the series list', () => {
    expect(loadSeriesSpy).toHaveBeenCalled();
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;
    let instantSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      instantSpy = vi
        .spyOn(component.translateService, 'instant')
        .mockReturnValue(TEST_TITLE_TRANSLATED);
      component.translateService.use('fr');
    });

    it('translates the title', () => {
      expect(instantSpy).toHaveBeenCalled();
    });

    it('updates the title', () => {
      expect(setTitleSpy).toHaveBeenCalledWith(TEST_TITLE_TRANSLATED);
    });
  });
});
