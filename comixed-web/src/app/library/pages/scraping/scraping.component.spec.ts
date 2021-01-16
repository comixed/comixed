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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrapingComponent } from './scraping.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectedComicsComponent } from '@app/library/components/selected-comics/selected-comics.component';
import { ComicEditComponent } from '@app/library/components/comic-edit/comic-edit.component';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  initialState as initialScrapingState,
  SCRAPING_FEATURE_KEY
} from '@app/library/reducers/scraping.reducer';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  LIBRARY_FEATURE_KEY,
  initialState as initialLibraryState
} from '@app/library/reducers/library.reducer';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TitleService } from '@app/core';
import { COMIC_2 } from '@app/library/library.fixtures';
import { loadScrapingVolumes } from '@app/library/actions/scraping.actions';

describe('ScrapingComponent', () => {
  const USER = USER_READER;
  const COMIC = COMIC_2;
  const API_KEY = '1234567890';
  const MAXIMUM_RECORDS = 100;
  const SKIP_CACHE = Math.random() > 0.5;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER },
    [LIBRARY_FEATURE_KEY]: { ...initialLibraryState },
    [SCRAPING_FEATURE_KEY]: { ...initialScrapingState }
  };

  let component: ScrapingComponent;
  let fixture: ComponentFixture<ScrapingComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ScrapingComponent,
        SelectedComicsComponent,
        ComicEditComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatIconModule,
        MatSelectModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapingComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language used is changed', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('reloads the page title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('when the comic is changed', () => {
    beforeEach(() => {
      component.currentComic = null;
      component.onSelectionChanged(COMIC);
    });

    it('sets the current comic', () => {
      expect(component.currentComic).toEqual(COMIC);
    });
  });

  describe('when scraping starts', () => {
    beforeEach(() => {
      component.onScrape({
        apiKey: API_KEY,
        series: COMIC.series,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE,
        issueNumber: COMIC.issueNumber,
        volume: COMIC.volume
      });
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        loadScrapingVolumes({
          apiKey: API_KEY,
          series: COMIC.series,
          maximumRecords: MAXIMUM_RECORDS,
          skipCache: SKIP_CACHE
        })
      );
    });
  });
});
