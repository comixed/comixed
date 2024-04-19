/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { ProcessingStatusPageComponent } from './processing-status-page.component';
import {
  IMPORT_COMIC_BOOKS_FEATURE_KEY,
  initialState as initialImportComicBooksComicsState
} from '@app/reducers/import-comic-books.reducer';
import { Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

describe('ProcessingStatusPageComponent', () => {
  const initialState = {
    [IMPORT_COMIC_BOOKS_FEATURE_KEY]: initialImportComicBooksComicsState
  };

  let component: ProcessingStatusPageComponent;
  let fixture: ComponentFixture<ProcessingStatusPageComponent>;
  let router: Router;
  let navigateByUrlSpy: jasmine.Spy;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProcessingStatusPageComponent],
      imports: [
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatProgressBarModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessingStatusPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when adding comic books is in process', () => {
    const BATCH_NAME = 'The Batch Name';
    const STARTED = Math.abs(Math.floor(Math.random() * 1000));
    const PROCESSED = Math.abs(Math.floor(Math.random() * 1000));
    const TOTAL = PROCESSED * 4;

    beforeEach(() => {
      navigateByUrlSpy.calls.reset();
      component.batches = [];

      store.setState({
        ...initialState,
        [IMPORT_COMIC_BOOKS_FEATURE_KEY]: {
          ...initialImportComicBooksComicsState,
          processing: {
            active: true,
            batches: [
              {
                batchName: BATCH_NAME,
                started: STARTED,
                total: TOTAL,
                processed: PROCESSED
              }
            ]
          }
        }
      });
    });

    it('sets the started value', () => {
      expect(component.batches[0].started).toEqual(STARTED);
    });

    it('sets the total value', () => {
      expect(component.batches[0].total).toEqual(TOTAL);
    });

    it('sets the processed value', () => {
      expect(component.batches[0].processed).toEqual(PROCESSED);
    });
  });
});
