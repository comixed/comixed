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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import {
  PROCESS_COMICS_FEATURE_KEY,
  initialState as initialImportCountState
} from '@app/reducers/process-comics.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';
import {
  initialState as initialLastReadState,
  LAST_READ_LIST_FEATURE_KEY
} from '@app/last-read/reducers/last-read-list.reducer';
import {
  LIBRARY_FEATURE_KEY,
  initialState as initialLibraryState
} from '@app/library/reducers/library.reducer';

describe('FooterComponent', () => {
  const initialState = {
    [PROCESS_COMICS_FEATURE_KEY]: initialImportCountState,
    [COMIC_BOOK_LIST_FEATURE_KEY]: initialComicBookListState,
    [LAST_READ_LIST_FEATURE_KEY]: initialLastReadState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState
  };
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FooterComponent],
        imports: [LoggerModule.forRoot()],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(FooterComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
