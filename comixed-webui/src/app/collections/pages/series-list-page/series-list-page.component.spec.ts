/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { SeriesListPageComponent } from './series-list-page.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { provideMockStore } from '@ngrx/store/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSortModule } from '@angular/material/sort';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';
import { USER_ADMIN } from '@app/user/user.fixtures';
import {
  initialState as initialSeriesState,
  SERIES_FEATURE_KEY
} from '@app/collections/reducers/series.reducer';
import {
  initialState as initialMetadataSourceListState,
  METADATA_SOURCE_LIST_FEATURE_KEY
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TitleService } from '@app/core/services/title.service';
import { SortableListItem } from '@app/core/models/ui/sortable-list-item';
import { Series } from '@app/collections/models/series';
import { SERIES_1 } from '@app/collections/collections.fixtures';

describe('SeriesListPageComponent', () => {
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER_ADMIN },
    [SERIES_FEATURE_KEY]: initialSeriesState,
    [METADATA_SOURCE_LIST_FEATURE_KEY]: initialMetadataSourceListState
  };

  let component: SeriesListPageComponent;
  let fixture: ComponentFixture<SeriesListPageComponent>;
  let titleService: TitleService;
  let titleServiceSpy: jasmine.Spy;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeriesListPageComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatToolbarModule,
        MatTableModule,
        MatSortModule,
        MatSelectModule,
        MatButtonModule,
        MatPaginatorModule,
        MatInputModule,
        MatFormFieldModule
      ],
      providers: [provideMockStore({ initialState }), TitleService]
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesListPageComponent);
    component = fixture.componentInstance;
    titleService = TestBed.inject(TitleService);
    titleServiceSpy = spyOn(titleService, 'setTitle');
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changing the active language', () => {
    beforeEach(() => {
      titleServiceSpy.calls.reset();
      translateService.use('fr');
    });

    it('updates the tab title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('sorting the table', () => {
    const ENTRY = { sortOrder: 1, item: SERIES_1 } as SortableListItem<Series>;

    it('can sort by publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'publisher')
      ).toEqual(ENTRY.item.publisher);
    });

    it('can sort by series name', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'name')
      ).toEqual(ENTRY.item.name);
    });

    it('can sort by volume', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'volume')
      ).toEqual(ENTRY.item.volume);
    });

    it('can sort by total issues', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'total-issues')
      ).toEqual(ENTRY.item.totalIssues);
    });

    it('can sort by comics in the library', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY.item, 'in-library')
      ).toEqual(ENTRY.item.inLibrary);
    });
  });
});
