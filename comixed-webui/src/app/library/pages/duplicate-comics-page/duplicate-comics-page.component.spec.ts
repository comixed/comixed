/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { DuplicateComicsPageComponent } from './duplicate-comics-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { provideMockStore } from '@ngrx/store/testing';
import {
  DUPLICATE_COMIC_FEATURE_KEY,
  initialState as initialDuplicateComicState
} from '@app/library/reducers/duplicate-comic.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ComicDetailListViewComponent } from '@app/comic-books/components/comic-detail-list-view/comic-detail-list-view.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';
import { ComicCoverUrlPipe } from '@app/comic-books/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { BehaviorSubject } from 'rxjs';

describe('DuplicateComicsPageComponent', () => {
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const initialState = {
    [DUPLICATE_COMIC_FEATURE_KEY]: initialDuplicateComicState
  };

  let component: DuplicateComicsPageComponent;
  let fixture: ComponentFixture<DuplicateComicsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DuplicateComicsPageComponent,
        ComicDetailListViewComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatDialogModule,
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: QueryParameterService,
          useValue: {
            filterText$: new BehaviorSubject<string>(null)
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateComicsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
