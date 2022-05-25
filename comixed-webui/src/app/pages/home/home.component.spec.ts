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
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CollectionsChartComponent } from '@app/components/collections-chart/collections-chart.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComicStateChartComponent } from '@app/components/comic-state-chart/comic-state-chart.component';
import { ComicsByYearChartComponent } from '@app/components/comics-by-year-chart/comics-by-year-chart.component';
import {
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/last-read/reducers/last-read-list.reducer';
import { ReadComicsChartComponent } from '@app/components/read-comics-chart/read-comics-chart.component';

describe('HomeComponent', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];
  const initialState = {
    [SERVER_STATUS_FEATURE_KEY]: initialServerStatusState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: initialComicBookListState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadState
  };

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let store: MockStore<any>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          HomeComponent,
          CollectionsChartComponent,
          ComicStateChartComponent,
          ComicsByYearChartComponent,
          ReadComicsChartComponent
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatToolbarModule,
          MatSelectModule,
          MatFormFieldModule,
          MatGridListModule,
          NgxChartsModule
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

  describe('when comics are finished loading', () => {
    beforeEach(() => {
      component.comicBooks = [];
      store.setState({
        ...initialState,
        [COMIC_BOOK_LIST_FEATURE_KEY]: {
          ...initialComicBookListState,
          loading: false,
          lastPayload: true,
          comicBooks: COMIC_BOOKS
        }
      });
    });

    it('sets the comics', () => {
      expect(component.comicBooks).toEqual(COMIC_BOOKS);
    });
  });
});
