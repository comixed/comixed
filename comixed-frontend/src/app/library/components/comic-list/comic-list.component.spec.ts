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
import { Routes } from '@angular/router/src/config';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { COMIC_1, COMIC_3, COMIC_5 } from 'app/comics/comics.fixtures';
import { ComicsModule } from 'app/comics/comics.module';
import {
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
import { LoggerTestingModule } from 'ngx-logger/testing';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import {
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  MenuItem,
  MessageService,
  ProgressSpinnerModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { BehaviorSubject } from 'rxjs';
import { ComicListComponent } from './comic-list.component';

describe('ComicListComponent', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const ROUTES: Routes = [{ path: 'test', component: ComicListComponent }];

  let component: ComicListComponent;
  let fixture: ComponentFixture<ComicListComponent>;
  let auth_adaptor: AuthenticationAdaptor;
  let library_adaptor: LibraryAdaptor;
  let library_display_adaptor: LibraryDisplayAdaptor;
  let selection_adaptor: SelectionAdaptor;
  let reading_list_adaptor: ReadingListAdaptor;
  let translate: TranslateService;
  let router: Router;
  let activated_route: ActivatedRoute;
  let confirm: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
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
    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    spyOn(auth_adaptor, 'setPreference');
    library_adaptor = TestBed.get(LibraryAdaptor);
    library_display_adaptor = TestBed.get(LibraryDisplayAdaptor);
    reading_list_adaptor = TestBed.get(ReadingListAdaptor);
    selection_adaptor = TestBed.get(SelectionAdaptor);
    translate = TestBed.get(TranslateService);
    router = TestBed.get(Router);
    activated_route = TestBed.get(ActivatedRoute);
    confirm = TestBed.get(ConfirmationService);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the selected language changes', () => {
    let old_menu: MenuItem[];

    beforeEach(() => {
      component.comics = COMICS;
      old_menu = component.contextMenu;
      spyOn(translate, 'instant');
      translate.use('fr');
    });

    it('reloads the context menu', () => {
      expect(translate.instant).toHaveBeenCalled();
      expect(component.contextMenu).not.toEqual(old_menu);
    });
  });

  describe('when the comic list changes', () => {
    beforeEach(() => {
      component.contextMenu = [];
      component._comics = [];
      spyOn(translate, 'instant');
      component.comics = COMICS;
    });

    it('sets the list of comics to display', () => {
      expect(component.comics).toEqual(COMICS);
    });

    it('reloads the context menu', () => {
      expect(component.contextMenu).not.toEqual([]);
      expect(translate.instant).toHaveBeenCalled();
    });
  });

  describe('when the selected comic list changes', () => {
    beforeEach(() => {
      component.contextMenu = [];
      component._selectedComics = [];
      spyOn(translate, 'instant');
      component.selectedComics = COMICS;
    });

    it('sets the list of comics to display', () => {
      expect(component.selectedComics).toEqual(COMICS);
    });

    it('reloads the context menu', () => {
      expect(component.contextMenu).not.toEqual([]);
      expect(translate.instant).toHaveBeenCalled();
    });
  });

  describe('when the display layout changes', () => {
    const dataview = {
      changeLayout: (layout: any) => {}
    };

    beforeEach(() => {
      spyOn(dataview, 'changeLayout');
      spyOn(library_display_adaptor, 'setLayout');
      component.setLayout(dataview, 'LIST');
    });

    it('notifies the data view', () => {
      expect(dataview.changeLayout).toHaveBeenCalledWith('LIST');
    });

    it('updates the library view state', () => {
      expect(library_display_adaptor.setLayout).toHaveBeenCalledWith('LIST');
    });
  });

  describe('when the first comic index is a query parameter', () => {
    beforeEach(() => {
      (activated_route.queryParams as BehaviorSubject<{}>).next({
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
      spyOn(selection_adaptor, 'selectComics');
      component.selectAll();
    });

    it('fires an action', () => {
      expect(selection_adaptor.selectComics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('when deselecting all comics', () => {
    beforeEach(() => {
      component._selectedComics = COMICS;
      spyOn(selection_adaptor, 'deselectComics');
      component.deselectAll();
    });

    it('fires an action', () => {
      expect(selection_adaptor.deselectComics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('when scraping the selected comics', () => {
    beforeEach(() => {
      component._selectedComics = COMICS;
      spyOn(router, 'navigate');
      component.scrapeComics();
    });

    it('navigates to the scraping page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/scraping']);
    });
  });

  describe('when deleting the selected comics', () => {
    beforeEach(() => {
      component._selectedComics = COMICS;
    });

    it('fires an action if the user approves', () => {
      spyOn(confirm, 'confirm').and.callFake((params: any) => {
        params.accept();
      });
      spyOn(library_adaptor, 'deleteComics');
      component.deleteComics();
      expect(library_adaptor.deleteComics).toHaveBeenCalledWith(
        COMICS.map(comic => comic.id)
      );
    });
  });
});
