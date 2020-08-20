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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/comics.fixtures';
import { ComicsModule } from 'app/comics/comics.module';
import {
  AppState,
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { LibraryEffects } from 'app/library/effects/library.effects';
import * as fromLibrary from 'app/library/reducers/library.reducer';
import * as fromSelect from 'app/library/reducers/selection.reducer';
import { AuthenticationAdaptor } from 'app/user';
import { LoggerModule } from '@angular-ru/logger';
import {
  ButtonModule,
  CheckboxModule,
  Confirmation,
  ConfirmationService,
  ContextMenuModule,
  DropdownModule,
  MessageService,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  ToolbarModule,
  TooltipModule,
  TreeModule
} from 'primeng/primeng';
import { ComicListToolbarComponent } from './comic-list-toolbar.component';
import { LibraryNavigationTreeComponent } from 'app/library/components/library-navigation-tree/library-navigation-tree.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ComicListToolbarComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const DESCRIPTION = 'The Description';
  const IMAGE_URL = 'http://server/image.jpg';

  let component: ComicListToolbarComponent;
  let fixture: ComponentFixture<ComicListToolbarComponent>;
  let confirmationService: ConfirmationService;
  let selectionAdaptor: SelectionAdaptor;
  let router: Router;
  let store: Store<AppState>;
  let translateService: TranslateService;
  let libraryAdaptor: LibraryAdaptor;
  let libraryDisplayAdaptor: LibraryDisplayAdaptor;
  let readingListAdaptor: ReadingListAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          fromLibrary.LIBRARY_FEATURE_KEY,
          fromLibrary.reducer
        ),
        StoreModule.forFeature(
          fromSelect.SELECTION_FEATURE_KEY,
          fromSelect.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        ToolbarModule,
        ButtonModule,
        TooltipModule,
        DropdownModule,
        SliderModule,
        CheckboxModule,
        SidebarModule,
        TreeModule,
        ScrollPanelModule,
        ContextMenuModule
      ],
      declarations: [ComicListToolbarComponent, LibraryNavigationTreeComponent],
      providers: [
        AuthenticationAdaptor,
        SelectionAdaptor,
        LibraryAdaptor,
        LibraryDisplayAdaptor,
        ReadingListAdaptor,
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListToolbarComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.get(ConfirmationService);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    selectionAdaptor = TestBed.get(SelectionAdaptor);
    router = TestBed.get(Router);
    spyOn(router, 'navigateByUrl');
    translateService = TestBed.get(TranslateService);
    libraryAdaptor = TestBed.get(LibraryAdaptor);
    libraryDisplayAdaptor = TestBed.get(LibraryDisplayAdaptor);
    readingListAdaptor = TestBed.get(ReadingListAdaptor);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('starting to scrape comics', () => {
    beforeEach(() => {
      component.selectedComics = COMICS;
      component.fireStartScraping();
    });

    it('emits an event', () => {
      component.startScraping.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      component.sortOptions = [];
      component.rowsOptions = [];
      translateService.use('fr');
    });

    it('loads the sort options', () => {
      expect(component.sortOptions).not.toEqual([]);
    });

    it('loads the row options', () => {
      expect(component.rowsOptions).not.toEqual([]);
    });
  });

  describe('when the description is set', () => {
    beforeEach(() => {
      component.imageUrl = null;
      component.description = DESCRIPTION;
    });

    it('sets the description', () => {
      expect(component.description).toEqual(DESCRIPTION);
    });

    it('does not enable showing details', () => {
      expect(component.enableDetails).toBeFalsy();
    });

    it('enables showing details when the image URL is present', () => {
      component.imageUrl = IMAGE_URL;
      expect(component.enableDetails).toBeTruthy();
    });
  });

  describe('when the image URL is set', () => {
    beforeEach(() => {
      component.description = null;
      component.imageUrl = IMAGE_URL;
    });

    it('sets the image URL', () => {
      expect(component.imageUrl).toEqual(IMAGE_URL);
    });

    it('does not enable showing details', () => {
      expect(component.enableDetails).toBeFalsy();
    });

    it('enables showing details when the image URL is present', () => {
      component.description = DESCRIPTION;
      expect(component.enableDetails).toBeTruthy();
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comics = COMICS;
      spyOn(selectionAdaptor, 'selectComics');
      component.selectAll();
    });

    it('calls the selection adaptor', () => {
      expect(selectionAdaptor.selectComics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('deselecting all comics', () => {
    beforeEach(() => {
      component.comics = COMICS;
      spyOn(selectionAdaptor, 'clearComicSelections');
      component.deselectAll();
    });

    it('calls the selection adaptor', () => {
      expect(selectionAdaptor.clearComicSelections).toHaveBeenCalled();
    });
  });

  describe('deleting the selected comics', () => {
    const SELECTED_COMICS = [
      { ...COMIC_1, deletedDate: null },
      { ...COMIC_3, deletedDate: new Date().getTime() }
    ];

    beforeEach(() => {
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirmation: Confirmation) => confirmation.accept()
      );
      spyOn(libraryAdaptor, 'deleteComics');
      component.selectedComics = SELECTED_COMICS;
      spyOn(selectionAdaptor, 'clearComicSelections');
      component.deleteComics();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('calls the library adaptor', () => {
      expect(libraryAdaptor.deleteComics).toHaveBeenCalledWith(
        SELECTED_COMICS.filter(comic => !comic.deletedDate).map(
          comic => comic.id
        )
      );
    });

    it('clears the selections', () => {
      expect(selectionAdaptor.clearComicSelections).toHaveBeenCalled();
    });
  });

  describe('changing the sort field', () => {
    const SORT_FIELD = 'addedDate';

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setSortField');
      component.changeSortField(SORT_FIELD);
    });

    it('calls the display adaptor', () => {
      expect(libraryDisplayAdaptor.setSortField).toHaveBeenCalledWith(
        SORT_FIELD
      );
    });
  });

  describe('changing the display rows', () => {
    const ROWS = 27;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setDisplayRows');
      component.changeRows(ROWS);
    });

    it('calls the display adaptor', () => {
      expect(libraryDisplayAdaptor.setDisplayRows).toHaveBeenCalledWith(ROWS);
    });
  });

  describe('changing the layout', () => {
    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setLayout');
      component.dataView = {
        changeLayout: jasmine.createSpy('changeLayout()')
      };
    });

    it('stores the preference for grids', () => {
      component.setGridLayout(true);
      expect(libraryDisplayAdaptor.setLayout).toHaveBeenCalledWith('grid');
    });

    it('stores the preference for lists', () => {
      component.setGridLayout(false);
      expect(libraryDisplayAdaptor.setLayout).toHaveBeenCalledWith('list');
    });
  });

  describe('setting the cover size', () => {
    const COVER_SIZE = 400;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setCoverSize');
      component.setCoverSize(COVER_SIZE, true);
    });

    it('stores the preference', () => {
      expect(libraryDisplayAdaptor.setCoverSize).toHaveBeenCalledWith(
        COVER_SIZE,
        true
      );
    });
  });

  describe('setting the same height', () => {
    const COVER_SIZE = 400;

    beforeEach(() => {
      spyOn(libraryDisplayAdaptor, 'setSameHeight');
      component.useSameHeight(true);
    });

    it('stores the preference', () => {
      expect(libraryDisplayAdaptor.setSameHeight).toHaveBeenCalledWith(true);
    });
  });

  it('can show the details', () => {
    component.showDetails = false;
    component.setDetailsVisible();
    expect(component.showDetails).toBeTruthy();
  });

  describe('creating a reading list', () => {
    beforeEach(() => {
      spyOn(readingListAdaptor, 'create');
      component.fireCreateReadingList();
    });

    it('notifies the reading list adaptor', () => {
      expect(readingListAdaptor.create).toHaveBeenCalled();
    });
  });
});
