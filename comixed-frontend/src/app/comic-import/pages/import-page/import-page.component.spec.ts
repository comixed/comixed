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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { AppState } from 'app/comic-import';
import { ComicFileGridItemComponent } from 'app/comic-import/components/comic-file-grid-item/comic-file-grid-item.component';
import { ComicFileListItemComponent } from 'app/comic-import/components/comic-file-list-item/comic-file-list-item.component';
import { ComicFileListToolbarComponent } from 'app/comic-import/components/comic-file-list-toolbar/comic-file-list-toolbar.component';
import { ComicFileListComponent } from 'app/comic-import/components/comic-file-list/comic-file-list.component';
import { ComicFileCoverUrlPipe } from 'app/comic-import/pipes/comic-file-cover-url.pipe';
import { LibraryAdaptor, LibraryDisplayAdaptor } from 'app/library';
import { LibraryUpdatesReceived } from 'app/library/actions/library.actions';
import { LibraryModule } from 'app/library/library.module';
import { UserService } from 'app/services/user.service';
import { AuthenticationAdaptor } from 'app/user';
import { UserModule } from 'app/user/user.module';
import { LoggerModule } from '@angular-ru/logger';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import {
  CheckboxModule,
  ConfirmationService,
  ContextMenuModule,
  MessageService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule
} from 'primeng/primeng';
import { ProgressBarModule } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ImportPageComponent } from './import-page.component';
import * as fromFindComicFiles from 'app/comic-import/reducers/find-comic-files.reducer';
import { FIND_COMIC_FILES_FEATURE_KEY } from 'app/comic-import/reducers/find-comic-files.reducer';
import { FindComicFilesEffects } from 'app/comic-import/effects/find-comic-files.effects';
import * as fromSelectedComicFiles from 'app/comic-import/reducers/selected-comic-files.reducer';
import { SELECTED_COMIC_FILES_FEATURE_KEY } from 'app/comic-import/reducers/selected-comic-files.reducer';
import { SelectedComicFilesEffects } from 'app/comic-import/effects/selected-comic-files.effects';
import * as fromImportComic from 'app/comic-import/reducers/import-comics.reducer';
import { IMPORT_COMICS_FEATURE_KEY } from 'app/comic-import/reducers/import-comics.reducer';
import { ImportComicsEffects } from 'app/comic-import/effects/import-comics.effects';

const DIRECTORY_TO_USE = '/OldUser/comixed/Downloads';

describe('ImportPageComponent', () => {
  let component: ImportPageComponent;
  let fixture: ComponentFixture<ImportPageComponent>;
  let libraryAdaptor: LibraryAdaptor;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        UserModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(
          FIND_COMIC_FILES_FEATURE_KEY,
          fromFindComicFiles.reducer
        ),
        StoreModule.forFeature(
          SELECTED_COMIC_FILES_FEATURE_KEY,
          fromSelectedComicFiles.reducer
        ),
        StoreModule.forFeature(
          IMPORT_COMICS_FEATURE_KEY,
          fromImportComic.reducer
        ),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([
          FindComicFilesEffects,
          SelectedComicFilesEffects,
          ImportComicsEffects
        ]),
        DataViewModule,
        SliderModule,
        ButtonModule,
        DropdownModule,
        ProgressBarModule,
        CardModule,
        SplitButtonModule,
        ToolbarModule,
        CheckboxModule,
        SidebarModule,
        ScrollPanelModule,
        OverlayPanelModule,
        PanelModule,
        ContextMenuModule
      ],
      declarations: [
        ImportPageComponent,
        ComicFileListComponent,
        ComicFileGridItemComponent,
        ComicFileListItemComponent,
        ComicFileListToolbarComponent,
        ComicFileCoverUrlPipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        BreadcrumbAdaptor,
        ConfirmationService,
        MessageService,
        UserService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    libraryAdaptor = TestBed.get(LibraryAdaptor);
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when not importing comics', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          comics: [],
          lastComicId: null,
          mostRecentUpdate: null,
          moreUpdates: false,
          lastReadDates: [],
          processingCount: 0,
          readingLists: []
        })
      );
      fixture.detectChanges();
    });

    it('does not show the progress indicator', () => {
      expect(
        fixture.debugElement.query(By.css('#import-busy-indicator-container'))
      ).toBeFalsy();
    });

    it('shows the comic file view', () => {
      expect(
        fixture.debugElement.query(By.css('#comic-file-list-container'))
      ).toBeTruthy();
    });
  });

  describe('when importing comics', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryUpdatesReceived({
          comics: [],
          lastComicId: null,
          mostRecentUpdate: null,
          moreUpdates: false,
          lastReadDates: [],
          processingCount: 17,
          readingLists: []
        })
      );
      fixture.detectChanges();
    });

    it('does not show the comic file view', () => {
      expect(
        fixture.debugElement.query(By.css('#comic-file-list-container'))
      ).toBeFalsy();
    });

    it('shows the progress indicator', () => {
      expect(
        fixture.debugElement.query(By.css('#import-busy-indicator-container'))
      ).toBeTruthy();
    });
  });
});
