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
import { CollectionGraphWidget } from './collection-graph-widget';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { beforeEach, Mock } from 'vitest';

describe('CollectionGraphWidget', () => {
  const TEST_STATISTICS: RemoteLibrarySegment[] = [
    { name: 'Segment 1', count: 29 },
    { name: 'Segment 3', count: 30 },
    { name: 'Segment 3', count: 17 },
    { name: 'Segment 4', count: 17 },
    { name: 'Segment 5', count: 20 },
    { name: 'Segment 6', count: 38 },
    { name: 'Segment 7', count: 72 },
    { name: 'Segment 8', count: 93 },
    { name: 'Segment 9', count: 829 },
    { name: 'Segment 10', count: 219 }
  ];
  const TEST_TITLE = 'The Segment Title';

  let component: CollectionGraphWidget;
  let fixture: ComponentFixture<CollectionGraphWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionGraphWidget]
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionGraphWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the statistical data', () => {
    beforeEach(() => {
      component.segment = TEST_STATISTICS;
    });

    it('should update the data', () => {
      expect(component.data()).not.toStrictEqual([]);
    });
  });

  describe('setting the title', () => {
    beforeEach(() => {
      component.title = TEST_TITLE;
    });

    it('should update the title', () => {
      expect(component.dataTitle()).toStrictEqual(TEST_TITLE);
    });
  });

  describe('when the user clicks the close button', () => {
    let emitSpy: Mock;

    beforeEach(() => {
      emitSpy = vi.spyOn(component.unzoom, 'emit');
      const button: HTMLButtonElement = fixture.nativeElement.querySelector(
        '#unzoom-button button'
      );
      button.click();
    });

    it('should emit an event', () => {
      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
