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
import { ComicDetailPage } from './comic-detail-page';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_DETAIL_FEATURE_KEY,
  initialComicDetailState
} from '@app/library/reducers/comic-detail.reducer';
import { provideRouter } from '@angular/router';
import { QueryParameterService } from '@app/layout/services/query-parameter.service';
import { beforeEach, Mock } from 'vitest';
import { QUERY_PARAM_COMIC_DETAIL_TAB } from '@app/library/library-constants';
import { COMIC_1 } from '@app/library/library-fixtures';
import { ComicDetailAction } from '@app/library/actions/comic-detail.actions';
import { TitleService } from '@app/layout/services/title-service';

describe('ComicDetailPage', () => {
  const initialState = { [COMIC_DETAIL_FEATURE_KEY]: initialComicDetailState };

  let component: ComicDetailPage;
  let fixture: ComponentFixture<ComicDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicDetailPage],
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideMockStore({ initialState }),
        QueryParameterService,
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailPage);
    component = fixture.componentInstance;
    // not fond of this hack, but it lets the MVP move forward
    const ResizeObserverMock = vi.fn(
      class {
        disconnect = vi.fn();
        observe = vi.fn();
        unobserve = vi.fn();
      }
    );
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  describe('changing tabs', () => {
    const TEST_TAB_NAME = 'test-tab';

    let updateQueryParamSpy: Mock;

    beforeEach(() => {
      updateQueryParamSpy = vi.spyOn(
        component.queryParameterService,
        'updateQueryParam'
      );
      component.onTabChanged(TEST_TAB_NAME);
    });

    it('updates the tab parameter', () => {
      expect(updateQueryParamSpy).toHaveBeenCalledWith([
        { name: QUERY_PARAM_COMIC_DETAIL_TAB, value: TEST_TAB_NAME }
      ]);
    });
  });

  describe('updating the comic', () => {
    const TEST_COMIC = COMIC_1;
    let dispatchSpy: Mock;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(component.store, 'dispatch');
      component.onUpdateComic(TEST_COMIC);
    });

    it('dispatches an action', () => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        ComicDetailAction.save({ comic: TEST_COMIC })
      );
    });
  });
});
