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
import { ComicDetailListDialogComponent } from './comic-detail-list-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3,
  COMIC_DETAIL_5
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
import { ComicDetailListViewComponent } from '@app/comic-books/components/comic-detail-list-view/comic-detail-list-view.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  initialState as initialLibraryPluginState,
  LIBRARY_PLUGIN_FEATURE_KEY
} from '@app/library-plugins/reducers/library-plugin.reducer';

describe('ComicDetailListDialogComponent', () => {
  const COMICS = [COMIC_DETAIL_1, COMIC_DETAIL_3, COMIC_DETAIL_5];
  const HASH = PAGE_1.hash;
  const initialState = {
    [COMIC_BOOK_LIST_FEATURE_KEY]: {
      ...initialComicBookListState,
      comicBooks: COMICS
    },
    [LIBRARY_PLUGIN_FEATURE_KEY]: initialLibraryPluginState
  };

  let component: ComicDetailListDialogComponent;
  let fixture: ComponentFixture<ComicDetailListDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ComicDetailListDialogComponent,
          ComicDetailCardComponent,
          ComicDetailListViewComponent,
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
          MatSortModule,
          MatTableModule,
          MatCheckboxModule
        ],
        providers: [
          provideMockStore({ initialState }),
          {
            provide: MatDialogRef,
            useValue: {}
          },
          {
            provide: MAT_DIALOG_DATA,
            useValue: COMICS
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicDetailListDialogComponent);
      component = fixture.componentInstance;
      component.comics = COMICS;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comic books', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      component.comics = COMICS;
    });

    it('updates the data source', () => {
      expect(component.dataSource.data).not.toEqual([]);
    });

    it('returns the set of comics', () => {
      expect(component.comics).toEqual(COMICS);
    });
  });
});
