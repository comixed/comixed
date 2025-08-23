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
import { ComicListFilterComponent } from './comic-list-filter.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { RouterTestingModule } from '@angular/router/testing';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ComicListFilterComponent', () => {
  let component: ComicListFilterComponent;
  let fixture: ComponentFixture<ComicListFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        FormsModule,
        ReactiveFormsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatCardModule,
        MatSelectModule,
        MatFormFieldModule,
        MatOptionModule,
        MatIconModule,
        MatInputModule,
        ComicListFilterComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closing the filter popup', () => {
    beforeEach(() => {
      spyOn(component.closeFilter, 'emit');
      component.onClose();
    });

    it('emits an event', () => {
      expect(component.closeFilter.emit).toHaveBeenCalled();
    });
  });

  describe('setting the cover years', () => {
    beforeEach(() => {
      component.displayableCoverYears = [];
      component.coverYears = [1965, 1971];
    });

    it('populates the displayable cover years', () => {
      expect(component.displayableCoverYears).not.toEqual([]);
    });
  });

  describe('setting the cover months', () => {
    beforeEach(() => {
      component.displayableCoverMonths = [];
      component.coverMonths = [1, 7];
    });

    it('populates the displayable cover months', () => {
      expect(component.displayableCoverMonths).not.toEqual([]);
    });
  });
});
