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
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { DataViewModule } from 'primeng/dataview';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicFileCoverUrlPipe } from 'app/pipes/comic-file-cover-url.pipe';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { ImportPageComponent } from './import-page.component';
import { By } from '@angular/platform-browser';
import { ComicFileListComponent } from 'app/ui/components/import/comic-file-list/comic-file-list.component';
import { ComicFileListToolbarComponent } from 'app/ui/components/import/comic-file-list-toolbar/comic-file-list-toolbar.component';
import { ComicFileGridItemComponent } from 'app/ui/components/import/comic-file-grid-item/comic-file-grid-item.component';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import {
  CheckboxModule,
  ConfirmationService,
  ContextMenuModule,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule
} from 'primeng/primeng';
import * as LibraryActions from 'app/actions/library.actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REDUCERS } from 'app/app.reducers';
import { UserPreferencePipe } from 'app/pipes/user-preference.pipe';
import { ComicFileListItemComponent } from 'app/ui/components/import/comic-file-list-item/comic-file-list-item.component';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';

const DIRECTORY_TO_USE = '/OldUser/comixed/Downloads';

describe('ImportPageComponent', () => {
  let component: ImportPageComponent;
  let fixture: ComponentFixture<ImportPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
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
        ComicCoverComponent,
        ComicCoverUrlPipe,
        ComicFileCoverUrlPipe,
        UserPreferencePipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService,
        { provide: ComicService, useClass: ComicServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);

    store.dispatch(new LibraryActions.LibraryReset());
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when not importing comics', () => {
    beforeEach(() => {
      store.dispatch(
        new LibraryActions.LibraryMergeNewComics({
          library_state: {
            import_count: 0,
            rescan_count: 0,
            comics: []
          }
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
        new LibraryActions.LibraryMergeNewComics({
          library_state: {
            import_count: 1,
            rescan_count: 0,
            comics: []
          }
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
