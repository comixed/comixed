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
import { ComicsWithDuplicatePageComponent } from './comics-with-duplicate-page.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { ComicBookCoversComponent } from '@app/library/components/comic-book-covers/comic-book-covers.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DuplicatePage } from '@app/library/models/duplicate-page';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicDetailCardComponent } from '@app/comic-books/components/comic-detail-card/comic-detail-card.component';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';
import { MatSortModule } from '@angular/material/sort';
import {
  COMIC_BOOK_LIST_FEATURE_KEY,
  initialState as initialComicBookListState
} from '@app/comic-books/reducers/comic-book-list.reducer';

describe('ComicsWithDuplicatePageComponent', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];
  const IDS = COMIC_BOOKS.map(comic => comic.id);
  const HASH = PAGE_1.hash;
  const initialState = {
    [COMIC_BOOK_LIST_FEATURE_KEY]: {
      ...initialComicBookListState,
      comicBooks: COMIC_BOOKS
    }
  };

  let component: ComicsWithDuplicatePageComponent;
  let fixture: ComponentFixture<ComicsWithDuplicatePageComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ComicsWithDuplicatePageComponent,
          ComicBookCoversComponent,
          LibraryToolbarComponent,
          ComicDetailCardComponent,
          ComicTitlePipe,
          ComicCoverUrlPipe
        ],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([
            {
              path: '**',
              redirectTo: ''
            }
          ]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatDialogModule,
          MatMenuModule,
          MatFormFieldModule,
          MatIconModule,
          MatSelectModule,
          MatToolbarModule,
          MatPaginatorModule,
          MatDividerModule,
          MatCardModule,
          MatExpansionModule,
          MatGridListModule,
          MatTooltipModule,
          MatSortModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: MatDialogRef,
            useValue: {}
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: { ids: IDS, hash: HASH } as DuplicatePage
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicsWithDuplicatePageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
