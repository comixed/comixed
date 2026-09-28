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
import { ArchiveTypesComponent } from './archive-types.component';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';

describe('ArchiveTypesComponent', () => {
  const CBZ_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const CBR_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const CB7_VALUE = Math.abs(Math.round(Math.random() * 1000));

  let component: ArchiveTypesComponent;
  let fixture: ComponentFixture<ArchiveTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveTypesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveTypesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides chart options', () => {
    expect(component.chartOptions).toBeTruthy();
  });

  describe('receiving updated data', () => {
    beforeEach(() => {
      component.data = [
        { name: ArchiveType.CBZ, count: CBZ_VALUE },
        { name: ArchiveType.CBR, count: CBR_VALUE },
        { name: ArchiveType.CB7, count: CB7_VALUE }
      ];
    });

    it('updates the CBZ statistics', () => {
      expect(
        component.chartData.value.find(entry => entry.name === ArchiveType.CBZ)
          .value
      ).toEqual(CBZ_VALUE);
    });

    it('updates the CBR statistics', () => {
      expect(
        component.chartData.value.find(entry => entry.name === ArchiveType.CBR)
          .value
      ).toEqual(CBR_VALUE);
    });

    it('updates the CB7 statistics', () => {
      expect(
        component.chartData.value.find(entry => entry.name === ArchiveType.CB7)
          .value
      ).toEqual(CB7_VALUE);
    });
  });
});
