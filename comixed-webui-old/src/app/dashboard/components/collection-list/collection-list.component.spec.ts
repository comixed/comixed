/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { CollectionListComponent } from './collection-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';

describe('CollectionListComponent', () => {
  let component: CollectionListComponent;
  let fixture: ComponentFixture<CollectionListComponent>;

  const COLLECTION_ENTRY = {
    name: 'the.name',
    count: 717
  } as RemoteLibrarySegmentState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CollectionListComponent,
        TranslateModule.forRoot(),
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sorting', () => {
    it('can sort by comic count', () => {
      expect(
        component.dataSource.sortingDataAccessor(
          COLLECTION_ENTRY,
          'comic-count'
        )
      ).toEqual(COLLECTION_ENTRY.count);
    });

    it('can sort by name', () => {
      expect(
        component.dataSource.sortingDataAccessor(COLLECTION_ENTRY, 'name')
      ).toEqual(COLLECTION_ENTRY.name);
    });
  });
});
