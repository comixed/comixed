/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { DuplicateComicsDetailPageComponent } from './duplicate-comics-detail-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { provideMockStore } from '@ngrx/store/testing';
import {
  DUPLICATE_COMICS_FEATURE_KEY,
  initialState as initialDuplicateComicsState
} from '@app/library/reducers/duplicate-comics.reducer';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  COMIC_LIST_FEATURE_KEY,
  initialState as initialComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import {
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  initialState as initialComicBookSelectionState
} from '@app/comic-books/reducers/comic-book-selection.reducer';
import { DUPLICATE_COMIC_1 } from '@app/library/library.fixtures';
import {
  initialState as initialLibraryPluginState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';

describe('DuplicateComicsDetailPageComponent', () => {
  const DUPLICATE_COMIC = DUPLICATE_COMIC_1;
  const initialState = {
    [DUPLICATE_COMICS_FEATURE_KEY]: initialDuplicateComicsState,
    [COMIC_LIST_FEATURE_KEY]: initialComicListState,
    [COMIC_BOOK_SELECTION_FEATURE_KEY]: initialComicBookSelectionState,
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginState
  };

  let component: DuplicateComicsDetailPageComponent;
  let fixture: ComponentFixture<DuplicateComicsDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        DuplicateComicsDetailPageComponent,
        RouterModule.forRoot([])
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(DuplicateComicsDetailPageComponent);
    component = fixture.componentInstance;
    component.publisher = DUPLICATE_COMIC.publisher;
    component.series = DUPLICATE_COMIC.series;
    component.volume = DUPLICATE_COMIC.volume;
    component.issueNumber = DUPLICATE_COMIC.issueNumber;
    component.coverDate = new Date(DUPLICATE_COMIC.coverDate);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
