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
import { ComicFileCoversComponent } from './comic-file-covers.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from '@app/comic-files/comic-file.fixtures';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import {
  clearComicFileSelections,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ComicFileToolbarComponent } from '@app/comic-files/components/comic-file-toolbar/comic-file-toolbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

describe('ComicFileCoversComponent', () => {
  const initialState = {};
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];
  const FILE = COMIC_FILE_4;
  const USER = USER_ADMIN;

  let component: ComicFileCoversComponent;
  let fixture: ComponentFixture<ComicFileCoversComponent>;
  let store: MockStore<any>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ComicFileCoversComponent, ComicFileToolbarComponent],
        imports: [
          NoopAnimationsModule,
          FormsModule,
          ReactiveFormsModule,
          TranslateModule.forRoot(),
          LoggerModule.forRoot(),
          MatMenuModule,
          MatPaginatorModule,
          MatIconModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatToolbarModule,
          MatTooltipModule
        ],
        providers: [provideMockStore({ initialState })]
      }).compileComponents();

      fixture = TestBed.createComponent(ComicFileCoversComponent);
      component = fixture.componentInstance;
      store = TestBed.inject(MockStore);
      spyOn(store, 'dispatch');
      component.user = USER;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('checking a selection', () => {
    const SELECTED_FILE = FILES[1];
    const NOT_SELECTED_FILE = FILES[2];

    beforeEach(() => {
      component.files = FILES;
      component.selectedFiles = [SELECTED_FILE];
    });

    it('returns true for an selected file', () => {
      expect(component.isFileSelected(SELECTED_FILE)).toBeTrue();
    });

    it('returns false for an unselected file', () => {
      expect(component.isFileSelected(NOT_SELECTED_FILE)).toBeFalse();
    });
  });

  describe('showing the context menu', () => {
    const XPOS = '7';
    const YPOS = '17';

    beforeEach(() => {
      component.file = null;
      spyOn(component.contextMenu, 'openMenu');
      component.onShowContextMenu(FILE, XPOS, YPOS);
    });

    it('sets the current comic file', () => {
      expect(component.file).toEqual(FILE);
    });

    it('set the context menu x position', () => {
      expect(component.contextMenuX).toEqual(XPOS);
    });

    it('set the context menu y position', () => {
      expect(component.contextMenuY).toEqual(YPOS);
    });

    it('shows the context menu', () => {
      expect(component.contextMenu.openMenu).toHaveBeenCalled();
    });
  });

  describe('setting the selected state for comic files', () => {
    beforeEach(() => {
      component.file = FILE;
    });

    describe('selecting one file', () => {
      beforeEach(() => {
        component.onSetOneSelected(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: true })
        );
      });
    });

    describe('deselecting one file', () => {
      beforeEach(() => {
        component.onSetOneSelected(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: false })
        );
      });
    });

    describe('deselecting all files', () => {
      beforeEach(() => {
        component.onDeselectAll();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(clearComicFileSelections());
      });
    });
  });

  describe('selecting all comic files', () => {
    beforeEach(() => {
      component.files = FILES;
      component.onSelectAll();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicFilesSelectedState({ files: FILES, selected: true })
      );
    });
  });
});
