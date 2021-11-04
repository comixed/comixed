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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HomeComponent } from '@app/pages/home/home.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { RouterTestingModule } from '@angular/router/testing';
import {
  initialState as initialServerStatusState,
  SERVER_STATUS_FEATURE_KEY
} from '@app/reducers/server-status.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import {
  COMIC_1,
  COMIC_3,
  COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HomeComponent', () => {
  const COMICS = [
    { ...COMIC_1, publisher: null, series: null },
    COMIC_3,
    COMIC_5
  ];
  const initialState = {
    [SERVER_STATUS_FEATURE_KEY]: initialServerStatusState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState
  };

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let store: MockStore<any>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatToolbarModule,
          MatSelectModule,
          MatFormFieldModule
        ],
        providers: [TitleService, provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      translateService = TestBed.inject(TranslateService);
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      store = TestBed.inject(MockStore);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when comics are loaded', () => {
    beforeEach(() => {
      component.charts = [];
      store.setState({
        ...initialState,
        [COMIC_LIST_FEATURE_KEY]: {
          ...initialComicListState,
          loading: false,
          lastPayload: true,
          comics: COMICS
        }
      });
    });

    it('loads the set of charts', () => {
      expect(component.charts).not.toEqual([]);
    });

    describe('changing the current chart', () => {
      beforeEach(() => {
        component.onShowChart(component.charts[1]);
      });

      it('changes the current chart', () => {
        expect(component.chart).toEqual(component.charts[1]);
      });
    });
  });
});
