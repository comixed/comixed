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
import { ComicFileListComponent } from './comic-file-list.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from '@app/library/library.fixtures';
import {
  COMIC_IMPORT_FEATURE_KEY,
  initialState as initialComicImportState
} from '@app/library/reducers/comic-import.reducer';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { setComicFilesSelectedState } from '@app/library/actions/comic-import.actions';

describe('ComicFileListComponent', () => {
  const initialState = { [COMIC_IMPORT_FEATURE_KEY]: initialComicImportState };
  const FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];
  const FILE = COMIC_FILE_4;

  let component: ComicFileListComponent;
  let fixture: ComponentFixture<ComicFileListComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicFileListComponent],
      imports: [
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        MatTableModule,
        MatCheckboxModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setting the list of comic files', () => {
    beforeEach(() => {
      component.files = FILES;
    });

    it('updates the set of files', () => {
      expect(component.files).toEqual(FILES);
    });
  });

  describe('setting the list of selected comic files', () => {
    beforeEach(() => {
      component.files = FILES;
      component.selectedFiles = FILES;
    });

    it('updates the set of selected files', () => {
      expect(component.selectedFiles).toEqual(FILES);
    });
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

  describe('selecting a comic file', () => {
    beforeEach(() => {
      component.onSelectFile(FILE, true);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicFilesSelectedState({ files: [FILE], selected: true })
      );
    });
  });

  describe('deselecting a comic file', () => {
    beforeEach(() => {
      component.onSelectFile(FILE, false);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicFilesSelectedState({ files: [FILE], selected: false })
      );
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.files = FILES;
      component.onSelectAll(true);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicFilesSelectedState({ files: FILES, selected: true })
      );
    });
  });

  describe('deselecting all comics', () => {
    beforeEach(() => {
      component.files = FILES;
      component.onSelectAll(false);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        setComicFilesSelectedState({ files: FILES, selected: false })
      );
    });
  });

  describe('selecting a row', () => {
    it('emits an event', () => {
      component.currentFile.subscribe(response =>
        expect(response).toEqual(FILE)
      );
    });

    afterEach(() => {
      component.onRowSelected(FILE);
    });
  });

  describe('sorting the data', () => {
    beforeEach(() => {
      component.files = FILES;
      component.selectedFiles = [COMIC_FILE_2, COMIC_FILE_4];
    });

    describe('sorting by selection state', () => {
      beforeEach(() => {
        component.onSortChanged({ active: '', direction: '' });
      });

      it('still has data', () => {
        expect(component.files).not.toEqual([]);
      });
    });

    describe('sorting by selection state', () => {
      beforeEach(() => {
        component.onSortChanged({ active: 'selected', direction: 'asc' });
      });

      it('still has data', () => {
        expect(component.files).not.toEqual([]);
      });
    });

    describe('sorting by filename', () => {
      beforeEach(() => {
        component.onSortChanged({ active: 'filename', direction: 'asc' });
      });

      it('still has data', () => {
        expect(component.files).not.toEqual([]);
      });
    });

    describe('sorting by size', () => {
      beforeEach(() => {
        component.onSortChanged({ active: 'size', direction: 'asc' });
      });

      it('still has data', () => {
        expect(component.files).not.toEqual([]);
      });
    });
  });
});
