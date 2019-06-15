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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { COMIC_1000 } from 'app/models/comics/comic.fixtures';
import { ComicCoverComponent } from './comic-cover.component';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { REDUCERS } from 'app/app.reducers';
import * as SelectionActions from 'app/actions/selection.actions';
import { EXISTING_COMIC_FILE_1 } from 'app/models/import/comic-file.fixtures';

describe('ComicCoverComponent', () => {
  let component: ComicCoverComponent;
  let fixture: ComponentFixture<ComicCoverComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(REDUCERS),
        OverlayPanelModule,
        PanelModule,
        CardModule,
        TranslateModule.forRoot()
      ],
      declarations: [ComicCoverComponent, ComicCoverUrlPipe, ComicTitlePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCoverComponent);
    component = fixture.componentInstance;
    component.comic = COMIC_1000;
    component.cover_size = 200;
    component.same_height = true;
    store = TestBed.get(Store);

    fixture.detectChanges();
  }));

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('when a selected comic is clicked', () => {
    beforeEach(() => {
      component.selected = true;
      spyOn(store, 'dispatch');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new SelectionActions.SelectionRemoveComics({
          comics: [component.comic]
        })
      );
    });
  });

  describe('when an unselected comic is clicked', () => {
    beforeEach(() => {
      component.selected = false;
      spyOn(store, 'dispatch');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new SelectionActions.SelectionAddComics({ comics: [component.comic] })
      );
    });
  });

  describe('when a selected comic file is clicked', () => {
    beforeEach(() => {
      component.comic = null;
      component.comic_file = EXISTING_COMIC_FILE_1;
      component.selected = true;
      spyOn(store, 'dispatch');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new SelectionActions.SelectionRemoveComicFiles({
          comic_files: [EXISTING_COMIC_FILE_1]
        })
      );
    });
  });

  describe('when an unselected comic file is clicked', () => {
    beforeEach(() => {
      component.comic = null;
      component.comic_file = EXISTING_COMIC_FILE_1;
      component.selected = false;
      spyOn(store, 'dispatch');
      component.toggle_selection();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new SelectionActions.SelectionAddComicFiles({
          comic_files: [EXISTING_COMIC_FILE_1]
        })
      );
    });
  });

  describe('when the comic is not selected', () => {
    beforeEach(() => {
      component.selected = false;
      fixture.detectChanges();
    });

    it('does not have the selected class on the container', () => {
      const elements = fixture.debugElement.query(By.css('.selected-comic'));
      expect(elements).toBeFalsy();
    });
  });

  describe('when the comic is selected', () => {
    beforeEach(() => {
      component.selected = true;
      fixture.detectChanges();
    });

    it('does not have the selected class on the container', () => {
      const elements = fixture.debugElement.query(By.css('.selected-comic'));
      expect(elements).toBeTruthy();
    });
  });
});
