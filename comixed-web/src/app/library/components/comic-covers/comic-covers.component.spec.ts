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
import { ComicCoversComponent } from './comic-covers.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DISPLAY_FEATURE_KEY,
  initialState as initialDisplayState
} from '@app/library/reducers/display.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MatTreeModule } from '@angular/material/tree';
import {
  initialState as initialLibraryState,
  LIBRARY_FEATURE_KEY
} from '@app/library/reducers/library.reducer';
import { MatBadgeModule } from '@angular/material/badge';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4
} from '@app/comic-book/comic-book.fixtures';
import {
  deselectComics,
  selectComics,
  setReadState
} from '@app/library/actions/library.actions';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { ComicBookState } from '@app/comic-book/models/comic-book-state';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { updateComicInfo } from '@app/comic-book/actions/update-comic-info.actions';
import { Confirmation } from '@app/core/models/confirmation';

describe('ComicCoversComponent', () => {
  const PAGINATION = 25;
  const COMIC = COMIC_2;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4];
  const initialState = {
    [DISPLAY_FEATURE_KEY]: initialDisplayState,
    [LIBRARY_FEATURE_KEY]: initialLibraryState
  };

  let component: ComicCoversComponent;
  let fixture: ComponentFixture<ComicCoversComponent>;
  let store: MockStore<any>;
  let dialog: MatDialog;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComicCoversComponent, LibraryToolbarComponent],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([{ path: '**', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatPaginatorModule,
        MatTreeModule,
        MatBadgeModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatDialogModule,
        MatMenuModule
      ],
      providers: [provideMockStore({ initialState }), ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCoversComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open');
    translateService = TestBed.inject(TranslateService);
    confirmationService = TestBed.inject(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading comics to display', () => {
    beforeEach(() => {
      component.dataSource.data = [];
      component.comics = COMICS;
    });

    it('loads the comics to display', () => {
      expect(component.comics).toEqual(COMICS);
    });
  });

  describe('checking if a comic is selected', () => {
    beforeEach(() => {
      component.selected = [COMIC_1];
    });

    it('returns true for selected comics', () => {
      expect(component.isSelected(COMIC_1)).toBeTrue();
    });

    it('returns false for unselected comics', () => {
      expect(component.isSelected(COMIC_2)).toBeFalse();
    });
  });

  describe('when a comic select event is received', () => {
    describe('selecting a comic', () => {
      beforeEach(() => {
        component.onSelectionChanged(COMIC, true);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          selectComics({ comics: [COMIC] })
        );
      });
    });

    describe('deselecting a comic', () => {
      beforeEach(() => {
        component.onSelectionChanged(COMIC, false);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          deselectComics({ comics: [COMIC] })
        );
      });
    });
  });

  describe('showing the context menu', () => {
    const XPOS = '7';
    const YPOS = '17';

    beforeEach(() => {
      component.comic = null;
      spyOn(component.contextMenu, 'openMenu');
      component.onShowContextMenu(COMIC, XPOS, YPOS);
    });

    it('sets the current comic', () => {
      expect(component.comic).toEqual(COMIC);
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

  describe('showing the comic details dialog', () => {
    beforeEach(() => {
      component.onShowComicDetails(COMIC);
    });

    it('opens the comic details dialog', () => {
      expect(dialog.open).toHaveBeenCalledWith(ComicDetailsDialogComponent, {
        data: COMIC
      });
    });
  });

  describe('setting the read state', () => {
    const READ = Math.random() > 0.5;

    describe('for one comic', () => {
      beforeEach(() => {
        component.onSetOneReadState(COMIC, READ);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setReadState({ comics: [COMIC], read: READ })
        );
      });
    });

    describe('for selected comic', () => {
      beforeEach(() => {
        component.selected = COMICS;
        component.onSetSelectedReadState(READ);
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setReadState({ comics: COMICS, read: READ })
        );
      });
    });
  });

  describe('checking if a comic is changed', () => {
    it('returns false when ADDED', () => {
      expect(
        component.isChanged({ ...COMIC, comicState: ComicBookState.ADDED })
      ).toBeFalse();
    });

    it('returns true when CHANGED', () => {
      expect(
        component.isChanged({ ...COMIC, comicState: ComicBookState.CHANGED })
      ).toBeTrue();
    });

    it('returns true when STABLE', () => {
      expect(
        component.isChanged({ ...COMIC, comicState: ComicBookState.STABLE })
      ).toBeFalse();
    });

    it('returns true when DELETED', () => {
      expect(
        component.isChanged({ ...COMIC, comicState: ComicBookState.DELETED })
      ).toBeFalse();
    });
  });

  describe('updating the comic info', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.confirm()
      );
      component.onUpdateComicInfo(COMIC);
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateComicInfo({ comic: COMIC })
      );
    });
  });
});
