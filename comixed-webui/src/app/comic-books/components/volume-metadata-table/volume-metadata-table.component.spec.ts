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
import { VolumeMetadataTableComponent } from './volume-metadata-table.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  SCRAPING_VOLUME_1,
  SCRAPING_VOLUME_2,
  SCRAPING_VOLUME_3
} from '@app/comic-metadata/comic-metadata.fixtures';
import { SortableListItem } from '@app/core/models/ui/sortable-list-item';
import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VolumeMetadataTitlePipe } from '@app/comic-books/pipes/volume-metadata-title.pipe';
import { MatIconModule } from '@angular/material/icon';

describe('VolumeMetadataTableComponent', () => {
  const VOLUMES = [SCRAPING_VOLUME_1, SCRAPING_VOLUME_2, SCRAPING_VOLUME_3];

  let component: VolumeMetadataTableComponent;
  let fixture: ComponentFixture<VolumeMetadataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeMetadataTableComponent, VolumeMetadataTitlePipe],
      imports: [
        NoopAnimationsModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatToolbarModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        MatIconModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeMetadataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading scraping volumes', () => {
    beforeEach(() => {
      component.publisher = SCRAPING_VOLUME_1.publisher;
      component.series = SCRAPING_VOLUME_1.name;
      component.volume = SCRAPING_VOLUME_1.startYear;
      component.dataSource.data = [];
      component.volumes = VOLUMES;
    });

    it('loads the table data source', () => {
      expect(component.dataSource.data).not.toEqual([]);
    });
  });

  describe('sorting', () => {
    const ENTRY = {
      sortOrder: 1,
      item: VOLUMES[0]
    } as SortableListItem<VolumeMetadata>;

    it('sorts by matchability', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'matchability')
      ).toEqual(ENTRY.sortOrder);
    });

    it('sorts by publisher', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'publisher')
      ).toEqual(ENTRY.item.publisher);
    });

    it('sorts by series', () => {
      expect(component.dataSource.sortingDataAccessor(ENTRY, 'name')).toEqual(
        ENTRY.item.name
      );
    });

    it('sorts by start year', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'start-year')
      ).toEqual(ENTRY.item.startYear);
    });

    it('sorts by issue count', () => {
      expect(
        component.dataSource.sortingDataAccessor(ENTRY, 'issue-count')
      ).toEqual(ENTRY.item.issueCount);
    });
  });

  describe('filtering data', () => {
    const ENTRY = {
      sortOrder: 1,
      item: VOLUMES[0]
    } as SortableListItem<VolumeMetadata>;

    it('filters by publisher', () => {
      expect(
        component.dataSource.filterPredicate(
          ENTRY,
          ENTRY.item.publisher.substring(1)
        )
      ).toBeTrue();
    });

    it('filters by series', () => {
      expect(
        component.dataSource.filterPredicate(
          ENTRY,
          ENTRY.item.name.substring(1)
        )
      ).toBeTrue();
    });

    it('does not match null', () => {
      expect(
        component.dataSource.filterPredicate(
          {
            ...ENTRY,
            item: { ...ENTRY.item, name: null }
          },
          'Test'
        )
      ).toBeFalse();
    });
  });

  describe('when a volume is selected', () => {
    beforeEach(() => {
      spyOn(component.volumeSelected, 'emit');
      component.onVolumeSelected(VOLUMES[0]);
    });

    it('emits an event', () => {
      expect(component.volumeSelected.emit).toHaveBeenCalledWith(VOLUMES[0]);
    });
  });

  describe('when a volume is chosen ', () => {
    beforeEach(() => {
      spyOn(component.volumeChosen, 'emit');
      component.onVolumeChosen(VOLUMES[1]);
    });

    it('emits an event', () => {
      expect(component.volumeChosen.emit).toHaveBeenCalledWith(VOLUMES[1]);
    });
  });
});
