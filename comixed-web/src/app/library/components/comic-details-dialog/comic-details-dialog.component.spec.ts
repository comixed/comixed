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
import { ComicDetailsDialogComponent } from './comic-details-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ComicTitlePipe } from '@app/comic-book/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from '@app/comic-book/pipes/comic-cover-url.pipe';
import { ComicPageComponent } from '@app/comic-book/components/comic-page/comic-page.component';
import { LoggerModule } from '@angular-ru/logger';
import { provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { MatCardModule } from '@angular/material/card';
import { USER_READER } from '@app/user/user.fixtures';
import { TranslateModule } from '@ngx-translate/core';

describe('ComicDetailsDialogComponent', () => {
  const USER = USER_READER;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: ComicDetailsDialogComponent;
  let fixture: ComponentFixture<ComicDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComicDetailsDialogComponent,
        ComicPageComponent,
        ComicTitlePipe,
        ComicCoverUrlPipe
      ],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatCardModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
