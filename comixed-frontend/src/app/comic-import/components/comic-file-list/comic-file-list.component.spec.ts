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
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicImportAdaptor } from 'app/comic-import/adaptors/comic-import.adaptor';
import { ComicFileGridItemComponent } from 'app/comic-import/components/comic-file-grid-item/comic-file-grid-item.component';
import { ComicFileListItemComponent } from 'app/comic-import/components/comic-file-list-item/comic-file-list-item.component';
import { ComicFileListToolbarComponent } from 'app/comic-import/components/comic-file-list-toolbar/comic-file-list-toolbar.component';
import { ComicImportEffects } from 'app/comic-import/effects/comic-import.effects';
import { ComicFile } from 'app/comic-import/models/comic-file';
import {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from 'app/comic-import/models/comic-file.fixtures';
import { ComicFileCoverUrlPipe } from 'app/comic-import/pipes/comic-file-cover-url.pipe';
import {
  COMIC_IMPORT_FEATURE_KEY,
  reducer
} from 'app/comic-import/reducers/comic-import.reducer';
import { LibraryDisplayAdaptor } from 'app/library';
import { LibraryModule } from 'app/library/library.module';
import { UserService } from 'app/services/user.service';
import { AuthenticationAdaptor } from 'app/user';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import {
  BlockUIModule,
  CardModule,
  CheckboxModule,
  ConfirmationService,
  ContextMenuModule,
  DropdownModule,
  MessageService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule,
  ToolbarModule
} from 'primeng/primeng';
import { ComicFileListComponent } from './comic-file-list.component';

describe('ComicFileListComponent', () => {
  const COMIC_FILES = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3, COMIC_FILE_4];

  let component: ComicFileListComponent;
  let fixture: ComponentFixture<ComicFileListComponent>;
  let comicImportAdaptor: ComicImportAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        FormsModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        LoggerTestingModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature(COMIC_IMPORT_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ComicImportEffects]),
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
        CardModule,
        ContextMenuModule,
        BlockUIModule
      ],
      declarations: [
        ComicFileListComponent,
        ComicFileGridItemComponent,
        ComicFileListItemComponent,
        ComicFileListToolbarComponent,
        ComicFileCoverUrlPipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ComicImportAdaptor,
        ConfirmationService,
        UserService,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileListComponent);
    component = fixture.componentInstance;
    comicImportAdaptor = TestBed.get(ComicImportAdaptor);

    fixture.detectChanges();
  }));

  describe('when no comic files are loaded', () => {
    beforeEach(() => {
      component.comicFiles = [];
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
      component.comicFiles = [COMIC_FILE_1, COMIC_FILE_2, COMIC_FILE_3];
      fixture.detectChanges();
    });

    it('shows the comic file list', () => {
      const fileList = fixture.debugElement.query(
        By.css('#comic-file-list-view')
      );
      expect(fileList).toBeTruthy();
    });

    it('has an entry for each comic displayed', () => {
      component.comicFiles.forEach((comicFile: ComicFile) => {
        const comicFileEntry = fixture.debugElement.query(
          By.css(`#comic-file-${comicFile.id}`)
        );
        expect(comicFileEntry).toBeTruthy();
      });
    });
  });

  describe('selecting a comic file', () => {
    const SELECTED_COMIC_FILE = COMIC_FILE_3;

    beforeEach(() => {
      spyOn(comicImportAdaptor, 'selectComicFiles');
      component.selectedComicFiles = [];
      component.setSelected(SELECTED_COMIC_FILE, true);
    });

    it('invokes the adaptor', () => {
      expect(comicImportAdaptor.selectComicFiles).toHaveBeenCalledWith([
        SELECTED_COMIC_FILE
      ]);
    });

    describe('unselecting a comic file', () => {
      beforeEach(() => {
        spyOn(comicImportAdaptor, 'deselectComicFiles');
        component.selectedComicFiles = [SELECTED_COMIC_FILE];
        component.setSelected(SELECTED_COMIC_FILE, false);
      });

      it('invokes the adaptor', () => {
        expect(comicImportAdaptor.deselectComicFiles).toHaveBeenCalledWith([
          SELECTED_COMIC_FILE
        ]);
      });
    });
  });
});
