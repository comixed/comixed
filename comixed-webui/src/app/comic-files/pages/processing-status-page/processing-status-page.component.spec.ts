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
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PROCESSING_COMIC_STATUS_1 } from '@app/comic-files/comic-file.fixtures';
import { TitleService } from '@app/core/services/title.service';

describe('ProcessingStatusPageComponent', () => {
  const STATUS = PROCESSING_COMIC_STATUS_1;
  const initialState = {
    [IMPORT_COMIC_BOOKS_FEATURE_KEY]: initialImportComicBooksComicsState
  };

  let component: ProcessingStatusPageComponent;
  let fixture: ComponentFixture<ProcessingStatusPageComponent>;
  let store: MockStore;
  let translateService: TranslateService;
  let titleService: TitleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
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
        QueryParameterService,
        TitleService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessingStatusPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    translateService = TestBed.inject(TranslateService);
    titleService = TestBed.inject(TitleService);
    spyOn(titleService, 'setTitle');
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

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
