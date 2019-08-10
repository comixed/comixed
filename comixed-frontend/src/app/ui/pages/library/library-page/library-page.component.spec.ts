/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as LibraryActions from 'app/actions/library.actions';
import { COMIC_1000, COMIC_1003 } from 'app/models/comics/comic.fixtures';
import * as FilterActions from 'app/actions/library-filter.actions';
import { DEFAULT_LIBRARY_FILTER } from 'app/models/actions/library-filter.fixtures';
import * as ScrapingActions from 'app/actions/multiple-comics-scraping.actions';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { SliderModule } from 'primeng/slider';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { SidebarModule } from 'primeng/sidebar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from 'primeng/card';
import { ComicListComponent } from 'app/ui/components/library/comic-list/comic-list.component';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { LibraryFilterPipe } from 'app/pipes/library-filter.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { UserService } from 'app/services/user.service';
import { UserServiceMock } from 'app/services/user.service.mock';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { LibraryPageComponent } from './library-page.component';
import { REDUCERS } from 'app/app.reducers';
import { ContextMenuModule } from 'primeng/primeng';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';

describe('LibraryPageComponent', () => {
  const COMIC = COMIC_1000;

  let component: LibraryPageComponent;
  let fixture: ComponentFixture<LibraryPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        ConfirmDialogModule,
        DataViewModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        OverlayPanelModule,
        CardModule,
        ContextMenuModule
      ],
      declarations: [
        LibraryPageComponent,
        ComicListComponent,
        ComicListToolbarComponent,
        LibraryFilterComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        ComicCoverComponent,
        LibraryFilterPipe,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService,
        { provide: UserService, useClass: UserServiceMock },
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    fixture.detectChanges();

    spyOn(store, 'dispatch').and.callThrough();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit()', () => {
    beforeEach(() => {
      store.dispatch(new LibraryActions.LibraryReset());
    });

    it('should subscribe to library updates', () => {
      store.dispatch(
        new LibraryActions.LibraryMergeNewComics({
          library_state: {
            comics: [COMIC_1000, COMIC_1003],
            rescan_count: 3,
            import_count: 7
          }
        })
      );
      expect(component.library.comics).toEqual([COMIC_1000, COMIC_1003]);
    });

    it('should subscribe to library filter updates', () => {
      DEFAULT_LIBRARY_FILTER.publisher = 'DC';
      store.dispatch(
        new FilterActions.LibraryFilterSetFilters(DEFAULT_LIBRARY_FILTER)
      );
      expect(component.library_filter.publisher).toEqual('DC');
    });

    it('should subscribe to scraping updates', () => {
      store.dispatch(
        new ScrapingActions.MultipleComicsScrapingSetup({
          api_key: '1234567890'
        })
      );
      expect(component.scraping.api_key).toEqual('1234567890');
    });

    xit('loads the layout from the URL');

    xit('loads the sort from the URL');

    xit('loads the rows from the URL');

    xit('loads the cover size from the URL');

    xit('loads the same height value from the URL');
  });
});
