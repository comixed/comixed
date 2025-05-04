/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
import { FilterTextFormComponent } from './filter-text-form.component';
import { QUERY_PARAM_FILTER_TEXT } from '@app/core';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('FilterTextFormComponent', () => {
  const FILTER_TEXT = 'the text';

  let component: FilterTextFormComponent;
  let fixture: ComponentFixture<FilterTextFormComponent>;
  let queryParameterService: QueryParameterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterTextFormComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [QueryParameterService]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterTextFormComponent);
    component = fixture.componentInstance;
    queryParameterService = TestBed.inject(QueryParameterService);
    spyOn(queryParameterService, 'updateQueryParam');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('applying a filter', () => {
    describe('adding a filter', () => {
      beforeEach(() => {
        component.onApplyFilter(FILTER_TEXT);
      });

      it('updates the query parameters', () => {
        expect(queryParameterService.updateQueryParam).toHaveBeenCalledWith([
          {
            name: QUERY_PARAM_FILTER_TEXT,
            value: FILTER_TEXT
          }
        ]);
      });
    });

    describe('clearing a filter', () => {
      beforeEach(() => {
        component.onApplyFilter('');
      });

      it('updates the query parameters', () => {
        expect(queryParameterService.updateQueryParam).toHaveBeenCalledWith([
          {
            name: QUERY_PARAM_FILTER_TEXT,
            value: null
          }
        ]);
      });
    });
  });
});
