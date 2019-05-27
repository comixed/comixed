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

import { ComicFileListItemComponent } from './comic-file-list-item.component';
import { StoreModule } from '@ngrx/store';
import { importingReducer } from 'app/reducers/importing.reducer';
import { ComicFileCoverUrlPipe } from 'app/pipes/comic-file-cover-url.pipe';
import { ComicCoverComponent } from 'app/ui/components/comic/comic-cover/comic-cover.component';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule, OverlayPanelModule, PanelModule } from 'primeng/primeng';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EXISTING_COMIC_FILE_1 } from 'app/models/import/comic-file.fixtures';

describe('ComicFileListItemComponent', () => {
  let component: ComicFileListItemComponent;
  let fixture: ComponentFixture<ComicFileListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        StoreModule.forRoot({ import_state: importingReducer }),
        TranslateModule.forRoot(),
        OverlayPanelModule,
        PanelModule,
        CardModule
      ],
      declarations: [
        ComicFileListItemComponent,
        ComicCoverComponent,
        ComicFileCoverUrlPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileListItemComponent);
    component = fixture.componentInstance;
    component.comic_file = EXISTING_COMIC_FILE_1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
