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
  CardModule, ConfirmationService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SplitButtonModule
} from 'primeng/primeng';
import { ComicFileGridItemComponent } from '../comic-file-grid-item/comic-file-grid-item.component';
import { ComicFileCoverUrlPipe } from '../../../../pipes/comic-file-cover-url.pipe';
import { ComicCoverComponent } from '../../comic/comic-cover/comic-cover.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import {
  EXISTING_COMIC_FILE_1,
  EXISTING_COMIC_FILE_2,
  EXISTING_COMIC_FILE_3, EXISTING_COMIC_FILE_4
} from '../../../../models/import/comic-file.fixtures';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DEFAULT_LIBRARY_DISPLAY } from '../../../../models/state/library-display.fixtures';
import { ComicFile } from '../../../../models/import/comic-file';

describe('SelectedComicFileListComponent', () => {
  let component: SelectedComicFileListComponent;
  let fixture: ComponentFixture<SelectedComicFileListComponent>;
  let comic_file_item: DebugElement;
  let store: Store<AppState>;

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
    })
      .compileComponents();

    fixture = TestBed.createComponent(SelectedComicFileListComponent);
    component = fixture.componentInstance;
    component.library_display = DEFAULT_LIBRARY_DISPLAY;
    component.display = true;
    component.selected_comic_files = [
      EXISTING_COMIC_FILE_1,
      EXISTING_COMIC_FILE_2,
      EXISTING_COMIC_FILE_3,
      EXISTING_COMIC_FILE_4
    ];
    store = TestBed.get(Store);

    fixture.detectChanges();

    comic_file_item = fixture.debugElement.query(By.css(`#comic-file-grid-item-${EXISTING_COMIC_FILE_1.id}`));
  }));

  afterEach(() => {
    component.display = false;
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
      expect(fixture.debugElement.query(By.css(`#comic-file-grid-item-${comic_file.id}`))).toBeTruthy();
    });
  });

  describe('when the import button is clicked', () => {
    xit('should start the import process');
  });
});
