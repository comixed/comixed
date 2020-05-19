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

import { ReadingListEditComponent } from './reading-list-edit.component';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Store, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule } from '@angular-ru/logger';
import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
import { AppState, ReadingListAdaptor } from 'app/library';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { READING_LIST_1 } from 'app/comics/models/reading-list.fixtures';
import { ReadingList } from 'app/comics/models/reading-list';
import {
  ReadingListCreate,
  ReadingListEdit
} from 'app/library/actions/reading-list.actions';
import {
  READING_LIST_FEATURE_KEY,
  reducer
} from 'app/library/reducers/reading-list.reducer';
import { ReadingListEffects } from 'app/library/effects/reading-list.effects';

describe('ReadingListEditComponent', () => {
  const READING_LIST = READING_LIST_1;
  const READING_LIST_ID = READING_LIST.id;
  const READING_LIST_NAME = READING_LIST.name;
  const READING_LIST_SUMMARY = READING_LIST.summary;
  const NEW_READING_LIST = {
    id: null,
    name: '',
    summary: '',
    comics: [],
    lastUpdated: null
  } as ReadingList;

  let component: ReadingListEditComponent;
  let fixture: ComponentFixture<ReadingListEditComponent>;
  let store: Store<AppState>;
  let readingListAdaptor: ReadingListAdaptor;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(READING_LIST_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ReadingListEffects]),
        DialogModule,
        ButtonModule
      ],
      declarations: [ReadingListEditComponent],
      providers: [
        MessageService,
        ConfirmationService,
        ComicAdaptor,
        ReadingListAdaptor
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingListEditComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    readingListAdaptor = TestBed.get(ReadingListAdaptor);
    confirmationService = TestBed.get(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when creating a reading list', () => {
    beforeEach(() => {
      store.dispatch(new ReadingListCreate());
    });

    it('loads the name', () => {
      expect(component.readingListForm.controls['name'].value).toEqual(
        NEW_READING_LIST.name
      );
    });

    it('loads the summary', () => {
      expect(component.readingListForm.controls['summary'].value).toEqual(
        NEW_READING_LIST.summary
      );
    });
  });

  describe('when editing a reading list', () => {
    beforeEach(() => {
      store.dispatch(new ReadingListEdit({ readingList: READING_LIST }));
    });

    it('loads the name', () => {
      expect(component.readingListForm.controls['name'].value).toEqual(
        READING_LIST.name
      );
    });

    it('loads the summary', () => {
      expect(component.readingListForm.controls['summary'].value).toEqual(
        READING_LIST.summary
      );
    });
  });

  describe('saving a reading list', () => {
    beforeEach(() => {
      spyOn(readingListAdaptor, 'save');
      store.dispatch(new ReadingListEdit({ readingList: READING_LIST }));
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      component.saveReadingList();
    });

    it('should call the reading list adaptor save method', () => {
      expect(readingListAdaptor.save).toHaveBeenCalledWith(
        READING_LIST_ID,
        READING_LIST_NAME,
        READING_LIST_SUMMARY
      );
    });
  });

  describe('canceling the edit', () => {
    beforeEach(() => {
      spyOn(readingListAdaptor, 'cancelEdit');
      component.cancelEditing();
    });

    it('calls the reading list adaptor cancel edit method', () => {
      expect(readingListAdaptor.cancelEdit).toHaveBeenCalled();
    });
  });
});
