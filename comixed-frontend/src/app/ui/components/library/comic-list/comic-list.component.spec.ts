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
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { DataViewModule } from 'primeng/dataview';
import { SidebarModule } from 'primeng/sidebar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from 'primeng/card';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicListComponent } from './comic-list.component';
import {
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  MenuItem
} from 'primeng/primeng';
import { REDUCERS } from 'app/app.reducers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_1000,
  COMIC_1002,
  COMIC_1004
} from 'app/models/comics/comic.fixtures';
import * as DisplayActions from 'app/actions/library-display.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Routes } from '@angular/router/src/config';
import { BehaviorSubject } from 'rxjs';
import * as LibraryActions from 'app/actions/library.actions';
import * as SelectionActions from 'app/actions/selection.actions';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';

describe('ComicListComponent', () => {
  const COMICS = [COMIC_1000, COMIC_1002, COMIC_1004];
  const ROUTES: Routes = [{ path: 'test', component: ComicListComponent }];

  let component: ComicListComponent;
  let fixture: ComponentFixture<ComicListComponent>;
  let auth_adaptor: AuthenticationAdaptor;
  let store: Store<AppState>;
  let translate: TranslateService;
  let router: Router;
  let activated_route: ActivatedRoute;
  let confirm: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes(ROUTES),
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        DataViewModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        OverlayPanelModule,
        CardModule,
        ConfirmDialogModule,
        ContextMenuModule
      ],
      declarations: [
        ComicListComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        ComicListToolbarComponent,
        ComicCoverComponent,
        LibraryFilterComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      providers: [
        AuthenticationAdaptor,
        ConfirmationService,
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
    spyOn(auth_adaptor, 'set_preference');
    store = TestBed.get(Store);
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
      old_menu = component.context_menu;
      spyOn(translate, 'instant');
      translate.use('fr');
    });

    it('reloads the context menu', () => {
      expect(translate.instant).toHaveBeenCalled();
      expect(component.context_menu).not.toEqual(old_menu);
    });
  });

  describe('when the comic list changes', () => {
    beforeEach(() => {
      component.context_menu = [];
      component._comics = [];
      spyOn(translate, 'instant');
      component.comics = COMICS;
    });

    it('sets the list of comics to display', () => {
      expect(component.comics).toEqual(COMICS);
    });

    it('reloads the context menu', () => {
      expect(component.context_menu).not.toEqual([]);
      expect(translate.instant).toHaveBeenCalled();
    });
  });

  describe('when the selected comic list changes', () => {
    beforeEach(() => {
      component.context_menu = [];
      component._selected_comics = [];
      spyOn(translate, 'instant');
      component.selected_comics = COMICS;
    });

    it('sets the list of comics to display', () => {
      expect(component.selected_comics).toEqual(COMICS);
    });

    it('reloads the context menu', () => {
      expect(component.context_menu).not.toEqual([]);
      expect(translate.instant).toHaveBeenCalled();
    });
  });

  describe('when the display layout changes', () => {
    const dataview = { changeLayout: (layout: any) => {} };

    beforeEach(() => {
      spyOn(store, 'dispatch');
      spyOn(dataview, 'changeLayout');
      component.set_layout(dataview, 'LIST');
    });

    it('notifies the data view', () => {
      expect(dataview.changeLayout).toHaveBeenCalledWith('LIST');
    });

    it('updates the library view state', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new DisplayActions.SetLibraryViewLayout({ layout: 'LIST' })
      );
    });

    it('updates the user preferences state', () => {
      expect(auth_adaptor.set_preference).toHaveBeenCalledWith(
        'library_display_layout',
        'LIST'
      );
    });
  });

  describe('when the first comic index is a query parameter', () => {
    beforeEach(() => {
      (activated_route.queryParams as BehaviorSubject<{}>).next({
        first: 29
      });
    });

    it('sets this as the first comic index variable', () => {
      expect(component.index_of_first).toEqual(29);
    });
  });

  describe('when the first comic index changes', () => {
    beforeEach(() => {
      spyOn(router, 'navigate');
      component.set_index_of_first(17);
    });

    it('updates the index', () => {
      expect(component.index_of_first).toEqual(17);
    });

    it('updates the query parameters', () => {
      expect(router.navigate).toHaveBeenCalled();
    });
  });

  describe('when opening a comic', () => {
    beforeEach(() => {
      spyOn(router, 'navigate');
      component.open_comic(COMIC_1000);
    });

    it('goes to the comic details page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/comics', COMIC_1000.id]);
    });
  });

  describe('when selecting all comics', () => {
    beforeEach(() => {
      component._comics = COMICS;
      spyOn(store, 'dispatch');
      component.select_all();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new SelectionActions.SelectionAddComics({ comics: COMICS })
      );
    });
  });

  describe('when deselecting all comics', () => {
    beforeEach(() => {
      component._selected_comics = COMICS;
      spyOn(store, 'dispatch');
      component.deselect_all();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new SelectionActions.SelectionRemoveComics({ comics: COMICS })
      );
    });
  });

  describe('when scraping the selected comics', () => {
    beforeEach(() => {
      component._selected_comics = COMICS;
      spyOn(router, 'navigate');
      component.scrape_comics();
    });

    it('navigates to the scraping page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/scraping']);
    });
  });

  describe('when deleting the selected comics', () => {
    beforeEach(() => {
      component._selected_comics = COMICS;
      spyOn(store, 'dispatch');
    });

    it('fires an action if the user approves', () => {
      spyOn(confirm, 'confirm').and.callFake((params: any) => {
        params.accept();
      });
      component.delete_comics();
      expect(store.dispatch).toHaveBeenCalledWith(
        new LibraryActions.LibraryDeleteMultipleComics({ comics: COMICS })
      );
    });
  });
});
