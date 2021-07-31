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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComicOverviewComponent } from './comic-overview.component';
import { LoggerModule } from '@angular-ru/logger';
import { ComicCoverUrlPipe } from '@app/comic-book/pipes/comic-cover-url.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_1 } from '@app/comic-book/comic-book.fixtures';
import { RouterTestingModule } from '@angular/router/testing';
import { ComicBookState } from '@app/comic-book/models/comic-book-state';
import { MatGridListModule } from '@angular/material/grid-list';
import { ComicvineIssueLinkPipe } from '@app/comic-book/pipes/comicvine-issue-link.pipe';

describe('ComicOverviewComponent', () => {
  const COMIC = COMIC_1;

  let component: ComicOverviewComponent;
  let fixture: ComponentFixture<ComicOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComicOverviewComponent,
        ComicCoverUrlPipe,
        ComicvineIssueLinkPipe
      ],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          {
            path: '*',
            redirectTo: ''
          }
        ]),
        MatGridListModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicOverviewComponent);
    component = fixture.componentInstance;
    component.comic = COMIC;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checking if a comic is changed', () => {
    describe('when ADDED', () => {
      beforeEach(() => {
        component.comic = { ...COMIC, comicState: ComicBookState.ADDED };
      });

      it('sets it to false', () => {
        expect(component.comicChanged).toBeFalse();
      });
    });

    describe('when CHANGED', () => {
      beforeEach(() => {
        component.comic = { ...COMIC, comicState: ComicBookState.CHANGED };
      });

      it('sets it to true', () => {
        expect(component.comicChanged).toBeTrue();
      });
    });

    describe('when STABLE', () => {
      beforeEach(() => {
        component.comic = { ...COMIC, comicState: ComicBookState.STABLE };
      });

      it('sets it to false', () => {
        expect(component.comicChanged).toBeFalse();
      });
    });

    describe('when DELETED', () => {
      beforeEach(() => {
        component.comic = { ...COMIC, comicState: ComicBookState.DELETED };
      });

      it('sets it to false', () => {
        expect(component.comicChanged).toBeFalse();
      });
    });
  });
});
