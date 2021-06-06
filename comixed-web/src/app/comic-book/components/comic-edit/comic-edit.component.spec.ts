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
import { ComicEditComponent } from './comic-edit.component';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { COMIC_2 } from '@app/comic-book/comic-book.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Confirmation } from '@app/core/models/confirmation';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  API_KEY_PREFERENCE,
  MAXIMUM_RECORDS_PREFERENCE
} from '@app/library/library.constants';
import { updateComic } from '@app/comic-book/actions/comic.actions';

describe('ComicEditComponent', () => {
  const COMIC = COMIC_2;
  const API_KEY = '1234567890ABCDEF';
  const SKIP_CACHE = Math.random() > 0.5;
  const MAXIMUM_RECORDS = 100;
  const ISSUE_NUMBER = '27';

  const initialState = {};

  let component: ComicEditComponent;
  let fixture: ComponentFixture<ComicEditComponent>;
  let store: MockStore<any>;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicEditComponent],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatToolbarModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({}), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicEditComponent);
    component = fixture.componentInstance;
    component.apiKey = API_KEY;
    component.maximumRecords = MAXIMUM_RECORDS;
    component.skipCache = SKIP_CACHE;
    component.comic = COMIC;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the comic', () => {
    beforeEach(() => {
      component.comic = COMIC;
    });

    it('updates the comic reference', () => {
      expect(component.comic).toEqual(COMIC);
    });
  });

  describe('undoing changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUndoChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });
  });

  it('sets the API key', () => {
    expect(component.apiKey).toEqual(API_KEY);
  });

  describe('fetching the scraping volumes', () => {
    beforeEach(() => {
      spyOn(component.scrape, 'emit');
      component.onFetchScrapingVolumes();
    });

    it('emits an event', () => {
      expect(component.scrape.emit).toHaveBeenCalledWith({
        apiKey: API_KEY,
        series: COMIC.series,
        volume: COMIC.volume,
        issueNumber: COMIC.issueNumber,
        maximumRecords: MAXIMUM_RECORDS,
        skipCache: SKIP_CACHE
      });
    });
  });

  describe('the API key', () => {
    describe('saving it', () => {
      beforeEach(() => {
        component.onSaveApiKey();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          saveUserPreference({ name: API_KEY_PREFERENCE, value: API_KEY })
        );
      });
    });

    describe('resetting it', () => {
      beforeEach(() => {
        component.comicForm.controls.apiKey.setValue(API_KEY.substr(1));
        fixture.detectChanges();
        component.onResetApiKey();
      });

      it('restores the original value', () => {
        expect(component.comicForm.controls.apiKey.value).toEqual(API_KEY);
      });
    });
  });

  describe('toggling skipping the cache', () => {
    beforeEach(() => {
      component.onSkipCacheToggle();
    });

    it('flips the skip cache flag', () => {
      expect(component.skipCache).toEqual(!SKIP_CACHE);
    });
  });

  describe('setting the maximum records', () => {
    beforeEach(() => {
      component.onMaximumRecordsChanged(MAXIMUM_RECORDS);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        saveUserPreference({
          name: MAXIMUM_RECORDS_PREFERENCE,
          value: `${MAXIMUM_RECORDS}`
        })
      );
    });
  });

  describe('saving changes', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.comic = COMIC;
      component.onSaveChanges();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateComic({ comic: COMIC })
      );
    });
  });

  describe('checking for the api key', () => {
    beforeEach(() => {
      component.comicForm.controls.apiKey.setValue(API_KEY);
    });

    it('returns true when set', () => {
      expect(component.hasApiKey).toBeTrue();
    });
  });
});
