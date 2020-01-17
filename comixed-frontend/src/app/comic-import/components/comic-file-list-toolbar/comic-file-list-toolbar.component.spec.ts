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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ComicImportAdaptor } from 'app/comic-import/adaptors/comic-import.adaptor';
import { ComicImportEffects } from 'app/comic-import/effects/comic-import.effects';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/models/comic-file.fixtures';
import {
  COMIC_IMPORT_FEATURE_KEY,
  reducer
} from 'app/comic-import/reducers/comic-import.reducer';
import { LibraryDisplayAdaptor } from 'app/library';
import { LibraryModule } from 'app/library/library.module';
import { UserService } from 'app/services/user.service';
import { AuthenticationAdaptor } from 'app/user';
import { LoggerTestingModule } from 'ngx-logger/testing';
import {
  ButtonModule,
  CheckboxModule,
  Confirmation,
  ConfirmationService,
  DropdownModule,
  InputTextModule,
  MessageService,
  SliderModule,
  SplitButtonModule,
  ToolbarModule
} from 'primeng/primeng';
import { ComicFileListToolbarComponent } from './comic-file-list-toolbar.component';

const DIRECTORY_TO_SEARCH = '/Users/comixed/library';

describe('ComicFileListToolbarComponent', () => {
  const DIRECTORY = '/home/comixed/Documents/comics';
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let component: ComicFileListToolbarComponent;
  let fixture: ComponentFixture<ComicFileListToolbarComponent>;
  let comicImportAdaptor: ComicImportAdaptor;
  let translateService: TranslateService;
  let confirmationService: ConfirmationService;
  let libraryDisplayAdaptor: LibraryDisplayAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_IMPORT_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicImportEffects]),
        TranslateModule.forRoot(),
        LoggerTestingModule,
        ToolbarModule,
        InputTextModule,
        ButtonModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        SplitButtonModule
      ],
      declarations: [ComicFileListToolbarComponent],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ComicImportAdaptor,
        UserService,
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileListToolbarComponent);
    component = fixture.componentInstance;
    comicImportAdaptor = TestBed.get(ComicImportAdaptor);
    translateService = TestBed.get(TranslateService);
    confirmationService = TestBed.get(ConfirmationService);
    libraryDisplayAdaptor = TestBed.get(LibraryDisplayAdaptor);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language is changed', () => {
    beforeEach(() => {
      component.sortFieldOptions = [];
      component.rowOptions = [];
      component.importOptions = [];
      translateService.use('fr');
    });

    it('reloads the sort field options', () => {
      expect(component.sortFieldOptions).not.toEqual([]);
    });

    it('reloads the row options', () => {
      expect(component.rowOptions).not.toEqual([]);
    });

    it('reloads the import options', () => {
      expect(component.importOptions).not.toEqual([]);
    });
  });

  describe('finding comics', () => {
    beforeEach(() => {
      spyOn(comicImportAdaptor, 'getComicFiles');
      component.directory = DIRECTORY;
      component.findComics();
    });

    it('invokes the adaptor', () => {
      expect(comicImportAdaptor.getComicFiles).toHaveBeenCalledWith(DIRECTORY);
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      spyOn(comicImportAdaptor, 'selectComicFiles');
      component.comicFiles = COMIC_FILES;
      component.selectAllComicFiles();
    });

    it('invokes the adaptor', () => {
      expect(comicImportAdaptor.selectComicFiles).toHaveBeenCalledWith(
        COMIC_FILES
      );
    });
  });

  describe('deselecting all comic files', () => {
    beforeEach(() => {
      spyOn(comicImportAdaptor, 'deselectComicFiles');
      component.selectedComicFiles = COMIC_FILES;
      component.deselectAllComicFiles();
    });

    it('invokes the adaptor', () => {
      expect(comicImportAdaptor.deselectComicFiles).toHaveBeenCalledWith(
        COMIC_FILES
      );
    });
  });

  describe('changing the sort field', () => {
    const SORT_FIELD = 'addedDate';

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setSortField');
      component.setSortField(SORT_FIELD);
    });

    it('invokes the adaptor', () => {
      expect(libraryDisplayAdaptor.setSortField).toHaveBeenCalledWith(
        SORT_FIELD,
        false
      );
    });
  });

  describe('changing the number of comics shown', () => {
    const COMICS_SHOWN = 50;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setDisplayRows');
      component.setComicsShown(COMICS_SHOWN);
    });

    it('invokes the adaptor', () => {
      expect(libraryDisplayAdaptor.setDisplayRows).toHaveBeenCalledWith(
        COMICS_SHOWN
      );
    });
  });

  describe('setting using the same height', () => {
    const SAME_HEIGHT = false;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setSameHeight');
      component.useSameHeight(SAME_HEIGHT);
    });

    it('invokes the adaptor', () => {
      expect(libraryDisplayAdaptor.setSameHeight).toHaveBeenCalledWith(
        SAME_HEIGHT
      );
    });
  });

  describe('setting the cover size', () => {
    const COVER_SIZE = 420;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setCoverSize');
      component.setCoverSize(COVER_SIZE);
    });

    it('invokes the adaptor', () => {
      expect(libraryDisplayAdaptor.setCoverSize).toHaveBeenCalledWith(
        COVER_SIZE,
        false
      );
    });
  });

  describe('saving the covers size', () => {
    const COVER_SIZE = 420;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setCoverSize');
      component.saveCoverSize(COVER_SIZE);
    });

    it('invokes the adaptor', () => {
      expect(libraryDisplayAdaptor.setCoverSize).toHaveBeenCalledWith(
        COVER_SIZE
      );
    });
  });

  it('can toggle blocked pages off', () => {
    component.deleteBlockedPages = true;
    component.toggleBlockedPages();
    expect(component.deleteBlockedPages).toBeFalsy();
  });

  it('can toggle blocked pages on', () => {
    component.deleteBlockedPages = false;
    component.toggleBlockedPages();
    expect(component.deleteBlockedPages).toBeTruthy();
  });

  describe('starting the import', () => {
    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      spyOn(comicImportAdaptor, 'startImport');
      component.selectedComicFiles = COMIC_FILES;
    });

    describe('with metadata', () => {
      beforeEach(() => {
        component.importOptions[0].command();
      });

      it('invokes the adaptor', () => {
        expect(comicImportAdaptor.startImport).toHaveBeenCalledWith(
          COMIC_FILES,
          false,
          component.deleteBlockedPages
        );
      });
    });

    describe('without metadata', () => {
      beforeEach(() => {
        component.deleteBlockedPages = !component.deleteBlockedPages;
        component.importOptions[1].command();
      });

      it('invokes the adaptor', () => {
        expect(comicImportAdaptor.startImport).toHaveBeenCalledWith(
          COMIC_FILES,
          true,
          component.deleteBlockedPages
        );
      });
    });
  });
});
