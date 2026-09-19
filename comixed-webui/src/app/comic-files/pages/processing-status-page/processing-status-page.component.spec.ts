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
  IMPORT_COMICS_FEATURE_KEY,
  initialState as initialImportComicBooksComicsState
} from '@app/reducers/import-comics.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PROCESSING_COMIC_STATUS_1 } from '@app/comic-files/comic-file.fixtures';
import { TitleService } from '@app/core/services/title.service';
import { provideRouter } from '@angular/router';
import { ProcessComicsService } from '@app/comic-books/services/process-comics.service';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';

describe('ProcessingStatusPageComponent', () => {
  const STATUS = PROCESSING_COMIC_STATUS_1;
  const PROCESS_LIST = [PROCESSING_COMIC_STATUS_1];
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [IMPORT_COMICS_FEATURE_KEY]: initialImportComicBooksComicsState
  };

  let component: ProcessingStatusPageComponent;
  let fixture: ComponentFixture<ProcessingStatusPageComponent>;
  let translateService: TranslateService;
  let titleService: TitleService;
  let store: MockStore;
  let processComicService: ProcessComicsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatProgressBarModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        ProcessingStatusPageComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        provideRouter([]),
        QueryParameterService,
        TitleService,
        ProcessComicsService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessingStatusPageComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
    store = TestBed.inject(MockStore);
    processComicService = TestBed.inject(ProcessComicsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    it('can sort by step name', () => {
      expect(
        component.dataSource.sortingDataAccessor(STATUS, 'step-name')
      ).toEqual(STATUS.stepName);
    });

    it('can sort by progress', () => {
      expect(
        component.dataSource.sortingDataAccessor(STATUS, 'progress')
      ).toEqual(STATUS.progress);
    });

    it('defaults to sort by step name', () => {
      expect(component.dataSource.sortingDataAccessor(STATUS, '')).toEqual(
        STATUS.stepName
      );
    });
  });

  describe('batch update processing', () => {
    beforeEach(() => {
      spyOn(processComicService, 'beep');
      component.dataSource.data = [];
      store.setState({
        ...initialState,
        [IMPORT_COMICS_FEATURE_KEY]: {
          ...initialImportComicBooksComicsState,
          batches: PROCESS_LIST
        }
      });
    });

    it('updates the data source', () => {
      expect(component.dataSource.data).toBe(PROCESS_LIST);
    });

    it('beeps the service', () => {
      expect(processComicService.beep).toHaveBeenCalled();
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
