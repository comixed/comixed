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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComicFileListItemComponent } from './comic-file-list-item.component';
import { ComicFileCoverUrlPipe } from 'app/comic-import/pipes/comic-file-cover-url.pipe';
import { TranslateModule } from '@ngx-translate/core';
import {
  CardModule,
  MessageService,
  OverlayPanelModule,
  PanelModule
} from 'primeng/primeng';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'app/services/user.service';
import { COMIC_FILE_1 } from 'app/comic-import/models/comic-file.fixtures';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

describe('ComicFileListItemComponent', () => {
  let component: ComicFileListItemComponent;
  let fixture: ComponentFixture<ComicFileListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        OverlayPanelModule,
        PanelModule,
        CardModule
      ],
      declarations: [ComicFileListItemComponent, ComicFileCoverUrlPipe],
      providers: [UserService, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileListItemComponent);
    component = fixture.componentInstance;
    component.comic_file = COMIC_FILE_1;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
