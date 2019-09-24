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
import { StoreModule } from '@ngrx/store';
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
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ComicListComponent } from './comic-list.component';
import {
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  MenuItem,
  MessageService
} from 'primeng/primeng';
import { REDUCERS } from 'app/app.reducers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  COMIC_1,
  COMIC_3,
  COMIC_5,
  LibraryAdaptor,
  SelectionAdaptor
} from 'app/library';
import { ActivatedRoute, Router } from '@angular/router';
import { Routes } from '@angular/router/src/config';
import { BehaviorSubject } from 'rxjs';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { ReadingListAdaptor } from 'app/library/adaptors/reading-list.adaptor';

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
        LibraryModule,
        HttpClientTestingModule,
        EffectsModule.forRoot(EFFECTS),
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
        LibraryDisplayAdaptor,
        ConfirmationService,
        MessageService,
        ComicService,
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
    spyOn(auth_adaptor, 'set_preference');
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
      spyOn(dataview, 'changeLayout');
      spyOn(library_display_adaptor, 'set_layout');
      component.set_layout(dataview, 'LIST');
    });

    it('notifies the data view', () => {
      expect(dataview.changeLayout).toHaveBeenCalledWith('LIST');
    });

    it('updates the library view state', () => {
      expect(library_display_adaptor.set_layout).toHaveBeenCalledWith('LIST');
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
  });

  describe('when opening a comic', () => {
    beforeEach(() => {
      spyOn(router, 'navigate');
      component.open_comic(COMIC_1);
    });

    it('goes to the comic details page', () => {
      expect(router.navigate).toHaveBeenCalledWith(['/comics', COMIC_1.id]);
    });
  });

  describe('when selecting all comics', () => {
    beforeEach(() => {
      component._comics = COMICS;
      spyOn(selection_adaptor, 'select_comics');
      component.select_all();
    });

    it('fires an action', () => {
      expect(selection_adaptor.select_comics).toHaveBeenCalledWith(COMICS);
    });
  });

  describe('when deselecting all comics', () => {
    beforeEach(() => {
      component._selected_comics = COMICS;
      spyOn(selection_adaptor, 'deselect_comics');
      component.deselect_all();
    });

    it('fires an action', () => {
      expect(selection_adaptor.deselect_comics).toHaveBeenCalledWith(COMICS);
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
    });

    it('fires an action if the user approves', () => {
      spyOn(confirm, 'confirm').and.callFake((params: any) => {
        params.accept();
      });
      spyOn(library_adaptor, 'delete_comics_by_id');
      component.delete_comics();
      expect(library_adaptor.delete_comics_by_id).toHaveBeenCalledWith(
        COMICS.map(comic => comic.id)
      );
    });
  });
});
