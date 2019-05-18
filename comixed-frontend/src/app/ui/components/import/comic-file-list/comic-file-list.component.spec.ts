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
import {
  EXISTING_COMIC_FILE_1,
  EXISTING_COMIC_FILE_2,
  EXISTING_COMIC_FILE_3
} from 'app/models/import/comic-file.fixtures';
import { DataViewModule } from 'primeng/dataview';
import { By } from '@angular/platform-browser';
import { ComicFileListComponent } from './comic-file-list.component';
import { ComicFileGridItemComponent } from 'app/ui/components/import/comic-file-grid-item/comic-file-grid-item.component';
import { ComicFile } from 'app/models/import/comic-file';
import { SelectedComicFileListComponent } from 'app/ui/components/import/selected-comic-file-list/selected-comic-file-list.component';
import { ComicFileListToolbarComponent } from 'app/ui/components/import/comic-file-list-toolbar/comic-file-list-toolbar.component';
import { ComicFileCoverUrlPipe } from 'app/pipes/comic-file-cover-url.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  CardModule,
  CheckboxModule,
  ConfirmationService,
  DropdownModule,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule,
  ToolbarModule
} from 'primeng/primeng';
import { Store, StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { AppState } from 'app/app.state';
import { DEFAULT_LIBRARY_DISPLAY } from 'app/models/state/library-display.fixtures';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REDUCERS } from 'app/app.reducers';

describe('ComicFileListComponent', () => {
  let component: ComicFileListComponent;
  let fixture: ComponentFixture<ComicFileListComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        DataViewModule,
        ButtonModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        ToolbarModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        OverlayPanelModule,
        PanelModule,
        CardModule
      ],
      declarations: [
        ComicFileListComponent,
        ComicFileGridItemComponent,
        ComicFileListToolbarComponent,
        SelectedComicFileListComponent,
        ComicCoverComponent,
        ComicFileCoverUrlPipe,
        ComicCoverUrlPipe
      ],
      providers: [ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileListComponent);
    component = fixture.componentInstance;
    component.comic_files = [];
    component.selected_comic_files = [];
    component.busy = false;
    component.library_display = DEFAULT_LIBRARY_DISPLAY;
    store = TestBed.get(Store);

    fixture.detectChanges();
  }));

  describe('when no comic files are loaded', () => {
    beforeEach(() => {
      component.comic_files = [];
      fixture.detectChanges();
    });

    it('shows a message that no files are loaded', () => {
      const message = fixture.debugElement.query(
        By.css('.ui-dataview-emptymessage')
      );
      expect(message).toBeTruthy();
    });
  });

  describe('when displaying a list of comic files', () => {
    beforeEach(() => {
      component.comic_files = [
        EXISTING_COMIC_FILE_1,
        EXISTING_COMIC_FILE_2,
        EXISTING_COMIC_FILE_3
      ];
      fixture.detectChanges();
    });

    it('shows the comic file list', () => {
      const file_list = fixture.debugElement.query(
        By.css('#comic-file-list-view')
      );
      expect(file_list).toBeTruthy();
    });

    it('has an entry for each comic displayed', () => {
      component.comic_files.forEach((comic_file: ComicFile) => {
        const comic_file_entry = fixture.debugElement.query(
          By.css(`#comic-file-${comic_file.id}`)
        );
        expect(comic_file_entry).toBeTruthy();
      });
    });
  });
});
