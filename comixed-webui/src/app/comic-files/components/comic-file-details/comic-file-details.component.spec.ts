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
import {
  CARD_WIDTH_PADDING,
  ComicFileDetailsComponent
} from './comic-file-details.component';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3
} from '@app/comic-files/comic-file.fixtures';
import { setComicFilesSelectedState } from '@app/comic-files/actions/comic-file-list.actions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  COMIC_FILE_LIST_FEATURE_KEY,
  initialState as initialComicFileListState
} from '@app/comic-files/reducers/comic-file-list.reducer';
import { ComicPageComponent } from '@app/comic-books/components/comic-page/comic-page.component';

describe('ComicFileDetailsComponent', () => {
  const FILE = COMIC_FILE_2;
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
  const initialState = {
    [COMIC_FILE_LIST_FEATURE_KEY]: initialComicFileListState
  };

  let component: ComicFileDetailsComponent;
  let fixture: ComponentFixture<ComicFileDetailsComponent>;
  let store: MockStore<any>;
  let dialog: jasmine.SpyObj<MatDialogRef<ComicFileDetailsComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      declarations: [ComicFileDetailsComponent, ComicPageComponent],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileDetailsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    dialog = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<ComicFileDetailsComponent>
    >;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggling selection', () => {
    beforeEach(() => {
      component.file = FILE;
    });

    describe('selecting the comic', () => {
      beforeEach(() => {
        component.onSelectFile(true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: true })
        );
      });
    });

    describe('deselecting the comic', () => {
      beforeEach(() => {
        component.onSelectFile(false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setComicFilesSelectedState({ files: [FILE], selected: false })
        );
      });
    });
  });

  describe('the card width', () => {
    const PAGE_SIZE = 400;

    beforeEach(() => {
      component.pageSize = PAGE_SIZE;
    });

    it('returns a padded card size', () => {
      expect(component.cardWidth).toEqual(
        `${PAGE_SIZE + CARD_WIDTH_PADDING}px`
      );
    });
  });

  describe('navigating the comic files', () => {
    beforeEach(() => {
      store.setState({
        ...initialState,
        [COMIC_FILE_LIST_FEATURE_KEY]: {
          ...initialComicFileListState,
          files: COMIC_FILES
        }
      });
    });

    it('disables the previous button when on the first entry', () => {
      component.file = COMIC_FILES[0];
      component.updateNavigationButtons();
      expect(component.noPreviousFile).toBeTrue();
    });

    it('disables the next button when on the last entry', () => {
      component.file = COMIC_FILES[2];
      component.updateNavigationButtons();
      expect(component.noNextFile).toBeTrue();
    });

    describe('going to the previous comic', () => {
      beforeEach(() => {
        component.file = COMIC_FILES[2];
        component.onPreviousFile();
      });

      it('updates the current comic file', () => {
        expect(component.file).toEqual(COMIC_FILES[1]);
      });

      it('enables the previous button', () => {
        expect(component.noPreviousFile).toBeFalse();
      });
    });

    describe('going to the next comic', () => {
      beforeEach(() => {
        component.file = COMIC_FILES[0];
        component.onNextFile();
      });

      it('updates the current comic file', () => {
        expect(component.file).toEqual(COMIC_FILES[1]);
      });

      it('enables the next button', () => {
        expect(component.noNextFile).toBeFalse();
      });
    });
  });
});
