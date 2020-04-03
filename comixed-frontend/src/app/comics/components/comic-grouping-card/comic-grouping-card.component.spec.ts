/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ComicGroupingCardComponent } from './comic-grouping-card.component';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';
import { CollectionType } from 'app/library/models/collection-type.enum';

export const DEFAULT_COMIC_GROUPING: ComicCollectionEntry = {
  name: 'grouping name',
  type: CollectionType.PUBLISHERS,
  count: 0,
  comics: [],
  last_comic_added: 0
};

describe('ComicGroupingCardComponent', () => {
  let component: ComicGroupingCardComponent;
  let fixture: ComponentFixture<ComicGroupingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), CardModule],
      declarations: [ComicGroupingCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicGroupingCardComponent);
    component = fixture.componentInstance;
    component.name = DEFAULT_COMIC_GROUPING.name;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
