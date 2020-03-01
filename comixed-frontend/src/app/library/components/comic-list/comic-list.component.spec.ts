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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
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
  SelectionAdaptor
} from 'app/library';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicListToolbarComponent } from 'app/library/components/comic-list-toolbar/comic-list-toolbar.component';
import { LibraryEffects } from 'app/library/effects/library.effects';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { UserService } from 'app/services/user.service';
import { AuthenticationAdaptor } from 'app/user';
import { ContextMenuShow } from 'app/user-experience/actions/context-menu.actions';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import { UserExperienceModule } from 'app/user-experience/user-experience.module';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import {
  Confirmation,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  MessageService,
  ProgressSpinnerModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { BehaviorSubject } from 'rxjs';
import {
  COMIC_LIST_MENU_DESELECT_ALL,
  COMIC_LIST_MENU_SELECT_ALL,
  ComicListComponent
} from './comic-list.component';

describe('ComicListComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const MOUSE_EVENT = new MouseEvent('mousedown');

  let component: ComicListComponent;
  let fixture: ComponentFixture<ComicListComponent>;
  let authenticationAdaptor: AuthenticationAdaptor;
  let libraryAdaptor: LibraryAdaptor;
  let libraryDisplayAdaptor: LibraryDisplayAdaptor;
  let selectionAdaptor: SelectionAdaptor;
  let readingListAdaptor: ReadingListAdaptor;
  let translateService: TranslateService;
  let router: Router;
  let activatedRoute: ActivatedRoute;
  let confirmationService: ConfirmationService;
  let contextMenuAdaptor: ContextMenuAdaptor;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        UserExperienceModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        FormsModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
        DataViewModule,
        SplitButtonModule,
        ScrollPanelModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        OverlayPanelModule,
        CardModule,
        ConfirmDialogModule,
        ContextMenuModule,
        TooltipModule,
        ToolbarModule,
        ProgressSpinnerModule,
        CheckboxModule
      ],
      declarations: [
        ComicListComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        ComicListToolbarComponent
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryAdaptor,
        SelectionAdaptor,
        ReadingListAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService,
        MessageService,
        UserService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: new BehaviorSubject<{}>({}),
            snapshot: { queryParams: {} }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListComponent);
    component = fixture.componentInstance;
    authenticationAdaptor = TestBed.get(AuthenticationAdaptor);
    spyOn(authenticationAdaptor, 'setPreference');
    libraryAdaptor = TestBed.get(LibraryAdaptor);
    libraryDisplayAdaptor = TestBed.get(LibraryDisplayAdaptor);
    readingListAdaptor = TestBed.get(ReadingListAdaptor);
    selectionAdaptor = TestBed.get(SelectionAdaptor);
    translateService = TestBed.get(TranslateService);
    router = TestBed.get(Router);
    activatedRoute = TestBed.get(ActivatedRoute);
    confirmationService = TestBed.get(ConfirmationService);
    contextMenuAdaptor = TestBed.get(ContextMenuAdaptor);
    store = TestBed.get(Store);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the comic list changes', () => {
    beforeEach(() => {
      component.contextMenuItems = [];
      component._comics = [];
      spyOn(translateService, 'instant');
      component.comics = COMICS;
    });

    it('sets the list of comics to display', () => {
      expect(component.comics).toEqual(COMICS);
    });

    it('reloads the context menu', () => {
      expect(component.contextMenuItems).not.toEqual([]);
      expect(translateService.instant).toHaveBeenCalled();
    });
  });

  describe('when the selected comic list changes', () => {
    beforeEach(() => {
      component.contextMenuItems = [];
      component._selectedComics = [];
      spyOn(translateService, 'instant');
      component.selectedComics = COMICS;
    });

    it('sets the list of comics to display', () => {
      expect(component.selectedComics).toEqual(COMICS);
    });

    it('reloads the context menu', () => {
      expect(component.contextMenuItems).not.toEqual([]);
      expect(translateService.instant).toHaveBeenCalled();
    });
  });

  describe('when the display layout changes', () => {
    const dataview = {
      changeLayout: (layout: any) => {}
    };

    beforeEach(() => {
      spyOn(dataview, 'changeLayout');
      spyOn(libraryDisplayAdaptor, 'setLayout');
      component.setLayout(dataview, 'LIST');
    });

    it('notifies the data view', () => {
      expect(dataview.changeLayout).toHaveBeenCalledWith('LIST');
    });

    it('updates the library view state', () => {
      expect(libraryDisplayAdaptor.setLayout).toHaveBeenCalledWith('LIST');
    });
  });

  describe('when the first comic index is a query parameter', () => {
    beforeEach(() => {
      (activatedRoute.queryParams as BehaviorSubject<{}>).next({
        first: 29
      });
    });

    it('sets this as the first comic index variable', () => {
      expect(component.indexOfFirst).toEqual(29);
    });
  });

  describe('when the first comic index changes', () => {
    beforeEach(() => {
      spyOn(router, 'navigate');
      component.setIndexOfFirst(17);
    });

    it('updates the index', () => {
      expect(component.indexOfFirst).toEqual(17);
    });
  });

  describe('when opening a comic', () => {
    beforeEach(() => {
      spyOn(router, 'navigate');
      component.openComic(COMIC_1);
    });

    it('goes to the comic details page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/comics', COMIC_1.id]);
    });
  });

  describe('when selecting all comics', () => {
    beforeEach(() => {
      component._comics = COMICS;
      spyOn(selectionAdaptor, 'selectComics');
      component.selectAll();
    });

    it('fires an action', () => {
      expect(selectionAdaptor.selectComics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('when deselecting all comics', () => {
    beforeEach(() => {
      component._selectedComics = COMICS;
      spyOn(selectionAdaptor, 'deselectComics');
      component.deselectAll();
    });

    it('fires an action', () => {
      expect(selectionAdaptor.deselectComics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('when scraping the selected comics', () => {
    beforeEach(() => {
      component._selectedComics = COMICS;
      spyOn(router, 'navigateByUrl');
      spyOn(confirmationService, 'confirm').and.callFake(
        (confirm: Confirmation) => confirm.accept()
      );
      component.scrapeComics();
    });

    it('confirms with the user', () => {
      expect(confirmationService.confirm).toHaveBeenCalled();
    });

    it('navigates to the scraping page', () => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/scraping');
    });
  });

  describe('when deleting the selected comics', () => {
    beforeEach(() => {
      component._selectedComics = COMICS;
    });

    it('fires an action if the user approves', () => {
      spyOn(confirmationService, 'confirm').and.callFake((params: any) => {
        params.accept();
      });
      spyOn(libraryAdaptor, 'deleteComics');
      component.deleteComics();
      expect(libraryAdaptor.deleteComics).toHaveBeenCalledWith(
        COMICS.map(comic => comic.id)
      );
    });
  });

  describe('when a mouse event occurs', () => {
    describe('with an actual event', () => {
      beforeEach(() => {
        spyOn(component.contextMenu, 'show');
        store.dispatch(new ContextMenuShow({ event: MOUSE_EVENT }));
      });

      it('shows the context menu', () => {
        expect(component.contextMenu.show).toHaveBeenCalledWith(MOUSE_EVENT);
      });
    });

    describe('with a null event', () => {
      beforeEach(() => {
        spyOn(component.contextMenu, 'show');
        store.dispatch(new ContextMenuShow({ event: null }));
      });

      it('shows the context menu', () => {
        expect(component.contextMenu.show).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the context menu is closed', () => {
    beforeEach(() => {
      spyOn(contextMenuAdaptor, 'hideMenu');
      component.hideContextMenu();
    });

    it('notifies the adaptor', () => {
      expect(contextMenuAdaptor.hideMenu).toHaveBeenCalled();
    });
  });

  describe('selecting all comics', () => {
    beforeEach(() => {
      component.comics = COMICS;
      spyOn(selectionAdaptor, 'selectComics');
      component.contextMenuItems
        .find(item => item.id === COMIC_LIST_MENU_SELECT_ALL)
        .command();
    });

    it('notifies the adaptor', () => {
      expect(selectionAdaptor.selectComics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('deselecting all comics', () => {
    beforeEach(() => {
      component.selectedComics = COMICS;
      spyOn(selectionAdaptor, 'deselectComics');
      component.contextMenuItems
        .find(item => item.id === COMIC_LIST_MENU_DESELECT_ALL)
        .command();
    });

    it('notifies the adaptor', () => {
      expect(selectionAdaptor.deselectComics).toHaveBeenCalledWith(COMICS);
    });
  });
});
