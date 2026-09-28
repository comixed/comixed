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
        QueryParameterService
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
});
