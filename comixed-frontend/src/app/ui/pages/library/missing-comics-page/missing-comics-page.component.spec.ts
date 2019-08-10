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

import { MissingComicsPageComponent } from './missing-comics-page.component';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { AppState } from 'app/app.state';
import * as LibraryActions from 'app/actions/library.actions';
import { COMIC_1000, COMIC_1002 } from 'app/models/comics/comic.fixtures';
import { MissingComicsPipe } from 'app/pipes/missing-comics.pipe';
import { ComicListComponent } from 'app/ui/components/library/comic-list/comic-list.component';
import { DataViewModule } from 'primeng/dataview';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import {
  CardModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  DropdownModule,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule
} from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';

describe('MissingComicsPageComponent', () => {
  let component: MissingComicsPageComponent;
  let fixture: ComponentFixture<MissingComicsPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(REDUCERS),
        TranslateModule.forRoot(),
        DataViewModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        PanelModule,
        OverlayPanelModule,
        CardModule,
        ConfirmDialogModule,
        ContextMenuModule
      ],
      declarations: [
        MissingComicsPageComponent,
        ComicListComponent,
        MissingComicsPipe,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        LibraryFilterComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe,
        ComicCoverComponent
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MissingComicsPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
    store.dispatch(new LibraryActions.LibraryReset());
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is subscribed to library changes', () => {
    const COMICS = [COMIC_1000, COMIC_1002];

    store.dispatch(
      new LibraryActions.LibraryMergeNewComics({
        library_state: {
          comics: COMICS,
          import_count: 0,
          rescan_count: 0
        }
      })
    );
    fixture.detectChanges();
    expect(component.comics).toEqual(COMICS);
  });
});
