/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { ComicGridItemComponent } from './comic-grid-item.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { DISPLAYABLE_COMIC_4 } from '@app/comic-books/comic-books.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  deleteSingleComicBook,
  undeleteSingleComicBook
} from '@app/comic-books/actions/delete-comic-books.actions';
import { provideRouter, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

describe('ComicGridItemComponent', () => {
  const initialState = {};
  const COMIC = DISPLAYABLE_COMIC_4;

  let component: ComicGridItemComponent;
  let fixture: ComponentFixture<ComicGridItemComponent>;
  let store: MockStore;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ComicGridItemComponent,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatCardModule,
        MatButtonModule
      ],
      providers: [provideMockStore(initialState), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicGridItemComponent);
    component = fixture.componentInstance;
    component.comic = DISPLAYABLE_COMIC_4;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('deleting a comic', () => {
    beforeEach(() => {
      component.onDeleteComic();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        deleteSingleComicBook({ comicBookId: COMIC.comicBookId })
      );
    });
  });

  describe('undeleting a comic', () => {
    beforeEach(() => {
      component.onUndeleteComic();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        undeleteSingleComicBook({ comicBookId: COMIC.comicBookId })
      );
    });
  });

  describe('opening a comic', () => {
    beforeEach(() => {
      component.onOpenComic();
    });

    it('fires an action', () => {
      expect(router.navigate).toHaveBeenCalledWith([
        '/comics',
        COMIC.comicBookId
      ]);
    });
  });
});
