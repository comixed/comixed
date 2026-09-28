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
import { StoryDetailCard } from './story-detail-card';
import { COMIC_TAG_1 } from '@app/library/library-fixtures';

describe('StoryDetailCard', () => {
  const TEST_TAG = COMIC_TAG_1;
  const TEST_LINK = 'the-link';

  let component: StoryDetailCard;
  let fixture: ComponentFixture<StoryDetailCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryDetailCard]
    }).compileComponents();

    fixture = TestBed.createComponent(StoryDetailCard);
    component = fixture.componentInstance;
    component.type = TEST_TAG.type;
    component.value = TEST_TAG.value;
    component.link = TEST_LINK;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
