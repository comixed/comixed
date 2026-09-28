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
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { SeriesComicListPage } from '@app/library/pages/series-comic-list-page/series-comic-list-page';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialSeriesComicListState,
  SERIES_COMIC_LIST_FEATURE_KEY,
  seriesComicListAdapter
} from '@app/library/reducers/series-comic-list.reducer';
import { ISSUE_1, ISSUE_2 } from '@app/library/library-fixtures';
import { beforeEach, Mock } from 'vitest';

describe('SeriesComicListPage', () => {
  const TEST_ISSUE_LIST = [ISSUE_1, ISSUE_2];
  const initialState = {
    [SERIES_COMIC_LIST_FEATURE_KEY]: seriesComicListAdapter.setAll(
      TEST_ISSUE_LIST,
      initialSeriesComicListState
    )
  };
  let component: SeriesComicListPage;
  let fixture: ComponentFixture<SeriesComicListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesComicListPage],
      providers: [
        provideRouter([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesComicListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the language', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('should update the page title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });
});
