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
import { ComicStatesComponent } from './comic-states.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComicState } from '@app/comic-books/models/comic-state';

describe('ComicStatesComponent', () => {
  const ADDED_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const DISCOVERED_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const UNPROCESSED_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const STABLE_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const CHANGED_VALUE = Math.abs(Math.round(Math.random() * 1000));
  const DELETED_VALUE = Math.abs(Math.round(Math.random() * 1000));

  let component: ComicStatesComponent;
  let fixture: ComponentFixture<ComicStatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComicStatesComponent],
      providers: [provideAnimationsAsync()]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicStatesComponent);
    component = fixture.componentInstance;
    component.data = [];
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
        { name: ComicState.ADDED, count: ADDED_VALUE },
        { name: ComicState.DISCOVERED, count: DISCOVERED_VALUE },
        { name: ComicState.UNPROCESSED, count: UNPROCESSED_VALUE },
        { name: ComicState.STABLE, count: STABLE_VALUE },
        { name: ComicState.CHANGED, count: CHANGED_VALUE },
        { name: ComicState.DELETED, count: DELETED_VALUE }
      ];
    });

    it('updates the added statistics', () => {
      expect(
        component.chartData.value.find(entry => entry.name === ComicState.ADDED)
          .value
      ).toEqual(ADDED_VALUE);
    });

    it('updates the discovered statistics', () => {
      expect(
        component.chartData.value.find(
          entry => entry.name === ComicState.DISCOVERED
        ).value
      ).toEqual(DISCOVERED_VALUE);
    });

    it('updates the unprocessed statistics', () => {
      expect(
        component.chartData.value.find(
          entry => entry.name === ComicState.UNPROCESSED
        ).value
      ).toEqual(UNPROCESSED_VALUE);
    });

    it('updates the stable statistics', () => {
      expect(
        component.chartData.value.find(
          entry => entry.name === ComicState.STABLE
        ).value
      ).toEqual(STABLE_VALUE);
    });

    it('updates the changed statistics', () => {
      expect(
        component.chartData.value.find(
          entry => entry.name === ComicState.CHANGED
        ).value
      ).toEqual(CHANGED_VALUE);
    });

    it('updates the deleted statistics', () => {
      expect(
        component.chartData.value.find(
          entry => entry.name === ComicState.DELETED
        ).value
      ).toEqual(DELETED_VALUE);
    });
  });
});
