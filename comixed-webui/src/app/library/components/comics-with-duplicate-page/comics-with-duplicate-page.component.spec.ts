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
import { ComicsWithDuplicatePageComponent } from './comics-with-duplicate-page.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { ComicCoversComponent } from '@app/library/components/comic-covers/comic-covers.component';
import { LoggerModule } from '@angular-ru/logger';
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
  COMIC_1,
  COMIC_3,
  COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicDetailCardComponent } from '@app/comic-books/components/comic-detail-card/comic-detail-card.component';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';

describe('ComicsWithDuplicatePageComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const HASH = PAGE_1.hash;
  const initialState = {};

  let component: ComicsWithDuplicatePageComponent;
  let fixture: ComponentFixture<ComicsWithDuplicatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComicsWithDuplicatePageComponent,
        ComicCoversComponent,
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
        MatTooltipModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { comics: COMICS, hash: HASH } as DuplicatePage
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicsWithDuplicatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
