/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DataViewModule } from 'primeng/dataview';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ScrapingComicListComponent } from './scraping-comic-list.component';
import {
  COMIC_1000,
  COMIC_1001,
  COMIC_1002,
  COMIC_1003
} from 'app/models/comics/comic.fixtures';
import { Comic } from 'app/models/comics/comic';

describe('ScrapingComicListComponent', () => {
  let component: ScrapingComicListComponent;
  let fixture: ComponentFixture<ScrapingComicListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DataViewModule],
      declarations: [ScrapingComicListComponent, ComicCoverUrlPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapingComicListComponent);
    component = fixture.componentInstance;
    component.comics = [];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#set comics()', () => {
    beforeEach(() => {
      component.comics = [COMIC_1003, COMIC_1002, COMIC_1001, COMIC_1000];
    });

    it('sorts the comics by filename', () => {
      component.comics.forEach((comic: Comic, index: number) => {
        let expected: Comic;

        switch (index) {
          case 0:
            expected = COMIC_1000;
            break;
          case 1:
            expected = COMIC_1001;
            break;
          case 2:
            expected = COMIC_1002;
            break;
          case 3:
            expected = COMIC_1003;
            break;
        }

        expect(comic).toBe(expected);
      });
    });
  });
});
