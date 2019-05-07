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

import { SelectedComicFileListComponent } from './selected-comic-file-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataViewModule } from 'primeng/dataview';
import {
  CardModule,
  Confirmation,
  ConfirmationService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SplitButtonModule
} from 'primeng/primeng';
import { ComicFileGridItemComponent } from 'app/ui/components/import/comic-file-grid-item/comic-file-grid-item.component';
import { ComicFileCoverUrlPipe } from 'app/pipes/comic-file-cover-url.pipe';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import {
  EXISTING_COMIC_FILE_1,
  EXISTING_COMIC_FILE_2,
  EXISTING_COMIC_FILE_3,
  EXISTING_COMIC_FILE_4
} from 'app/models/import/comic-file.fixtures';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DEFAULT_LIBRARY_DISPLAY } from 'app/models/state/library-display.fixtures';
import { ComicFile } from 'app/models/import/comic-file';
import * as ImportActions from 'app/actions/importing.actions';
import {
  COMIC_1000,
  COMIC_1002,
  COMIC_1004
} from 'app/models/comics/comic.fixtures';

describe('SelectedComicFileListComponent', () => {
  let component: SelectedComicFileListComponent;
  let fixture: ComponentFixture<SelectedComicFileListComponent>;
  let comic_file_item: DebugElement;
  let store: Store<AppState>;
  let confirmation_service: ConfirmationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        StoreModule.forRoot({}),
        TranslateModule.forRoot(),
        SidebarModule,
        SplitButtonModule,
        DataViewModule,
        ScrollPanelModule,
        OverlayPanelModule,
        CardModule,
        PanelModule
      ],
      declarations: [
        SelectedComicFileListComponent,
        ComicFileGridItemComponent,
        ComicCoverComponent,
        ComicFileCoverUrlPipe
      ],
      providers: [ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedComicFileListComponent);
    component = fixture.componentInstance;
    component.library_display = DEFAULT_LIBRARY_DISPLAY;
    component.library_display.show_selections = true;
    component.selected_comic_files = [
      EXISTING_COMIC_FILE_1,
      EXISTING_COMIC_FILE_2,
      EXISTING_COMIC_FILE_3,
      EXISTING_COMIC_FILE_4
    ];
    store = TestBed.get(Store);
    confirmation_service = TestBed.get(ConfirmationService);

    fixture.detectChanges();

    comic_file_item = fixture.debugElement.query(
      By.css(`#comic-file-grid-item-${EXISTING_COMIC_FILE_1.id}`)
    );
  }));

  afterEach(() => {
    component.library_display.show_selections = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a grid item for each comic selected', () => {
    [
      EXISTING_COMIC_FILE_1,
      EXISTING_COMIC_FILE_2,
      EXISTING_COMIC_FILE_3,
      EXISTING_COMIC_FILE_4
    ].forEach((comic_file: ComicFile) => {
      expect(
        fixture.debugElement.query(
          By.css(`#comic-file-grid-item-${comic_file.id}`)
        )
      ).toBeTruthy();
    });
  });

  describe('when importing comics', () => {
    let comic_filenames: Array<string>;

    beforeEach(() => {
      comic_filenames = [];
      component.selected_comic_files = [
        EXISTING_COMIC_FILE_1,
        EXISTING_COMIC_FILE_3
      ];
      component.selected_comic_files.forEach((file: ComicFile) => {
        comic_filenames.push(file.filename);
      });
      spyOn(store, 'dispatch');
    });

    it('confirms with the user', () => {
      spyOn(confirmation_service, 'confirm').and.callThrough();
      component.import_files(true);
      expect(confirmation_service.confirm).toHaveBeenCalled();
    });

    it('fires an action and ignores metadata on confirmation ', () => {
      spyOn(confirmation_service, 'confirm').and.callFake(
        (confirmation: Confirmation) => {
          confirmation.accept();
        }
      );
      component.import_files(true);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ImportActions.ImportingImportFiles({
          files: comic_filenames,
          ignore_metadata: true
        })
      );
    });

    it('fires an action and includes metadata on confirmation ', () => {
      spyOn(confirmation_service, 'confirm').and.callFake(
        (confirmation: Confirmation) => {
          confirmation.accept();
        }
      );
      component.import_files(false);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ImportActions.ImportingImportFiles({
          files: comic_filenames,
          ignore_metadata: false
        })
      );
    });

    it('does not on decline', () => {
      spyOn(confirmation_service, 'confirm');
      component.import_files(false);
      expect(store.dispatch).not.toHaveBeenCalledWith(
        new ImportActions.ImportingImportFiles({
          files: comic_filenames,
          ignore_metadata: false
        })
      );
    });
  });
});
