/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ComicStoryComponent } from './comic-story.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_BOOK_1 } from '@app/comic-books/comic-books.fixtures';
import { MatExpansionModule } from '@angular/material/expansion';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComicDetailCardComponent } from '@app/comic-books/components/comic-detail-card/comic-detail-card.component';
import { provideMockStore } from '@ngrx/store/testing';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { RouterTestingModule } from '@angular/router/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

describe('ComicStoryComponent', () => {
  const COMIC_BOOK = COMIC_BOOK_1;
  const initialState = {};

  let component: ComicStoryComponent;
  let fixture: ComponentFixture<ComicStoryComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicStoryComponent, ComicDetailCardComponent],
        imports: [
          NoopAnimationsModule,
          RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatExpansionModule,
          MatCardModule,
          MatChipsModule,
          MatTooltipModule,
          MatIconModule
        ],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicStoryComponent);
      component = fixture.componentInstance;
      component.comic = COMIC_BOOK;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading a comic', () => {
    beforeEach(() => {
      component.credits = [];
      component.characters = [];
      component.teams = [];
      component.locations = [];
      component.stories = [];
      component.comic = COMIC_BOOK;
    });

    it('loads the credits', () => {
      expect(component.credits).not.toEqual([]);
    });
    it('loads the characters', () => {
      expect(component.characters).not.toEqual([]);
    });
    it('loads the teams', () => {
      expect(component.teams).not.toEqual([]);
    });
    it('loads the locations', () => {
      expect(component.locations).not.toEqual([]);
    });
    it('loads the stories', () => {
      expect(component.stories).not.toEqual([]);
    });
  });
});
