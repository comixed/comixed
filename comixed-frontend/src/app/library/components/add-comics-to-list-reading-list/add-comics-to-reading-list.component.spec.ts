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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComicsToReadingListComponent } from './add-comics-to-reading-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {
  LibraryAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { StoreModule } from '@ngrx/store';
import * as forReadingList from 'app/library/reducers/reading-list.reducer';
import { READING_LIST_FEATURE_KEY } from 'app/library/reducers/reading-list.reducer';
import * as forLibrary from 'app/library/reducers/library.reducer';
import { LIBRARY_FEATURE_KEY } from 'app/library/reducers/library.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ReadingListEffects } from 'app/library/effects/reading-list.effects';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { ComicsModule } from 'app/comics/comics.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ListboxModule } from 'primeng/listbox';

describe('AddComicsToReadingListComponent', () => {
  let component: AddComicsToReadingListComponent;
  let fixture: ComponentFixture<AddComicsToReadingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          READING_LIST_FEATURE_KEY,
          forReadingList.reducer
        ),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, forLibrary.reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ReadingListEffects, LibraryEffects]),
        ListboxModule,
        DialogModule,
        ButtonModule
      ],
      declarations: [AddComicsToReadingListComponent],
      providers: [
        ReadingListAdaptor,
        LibraryAdaptor,
        SelectionAdaptor,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddComicsToReadingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
