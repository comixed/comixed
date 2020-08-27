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
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { COMIC_FILE_1 } from 'app/comic-import/models/comic-file.fixtures';
import { ComicFileCoverUrlPipe } from 'app/comic-import/pipes/comic-file-cover-url.pipe';
import { LibraryModule } from 'app/library/library.module';
import { UserService } from 'app/services/user.service';
import { LoggerModule } from '@angular-ru/logger';
import {
  CardModule,
  ConfirmationService,
  MessageService,
  OverlayPanelModule,
  PanelModule
} from 'primeng/primeng';
import { ComicFileGridItemComponent } from './comic-file-grid-item.component';

describe('ComicFileGridItemComponent', () => {
  let component: ComicFileGridItemComponent;
  let fixture: ComponentFixture<ComicFileGridItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        PanelModule,
        OverlayPanelModule,
        CardModule
      ],
      declarations: [ComicFileGridItemComponent, ComicFileCoverUrlPipe],
      providers: [UserService, MessageService, ConfirmationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicFileGridItemComponent);
    component = fixture.componentInstance;
    component.comic_file = COMIC_FILE_1;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an id based on the comic file id', () => {
    expect(
      fixture.debugElement.query(
        By.css(`#comic-file-${component.comic_file.id}`)
      )
    ).toBeTruthy();
  });

  it('should have a comic cover with an id based on the comic file id', () => {
    expect(
      fixture.debugElement.query(
        By.css(`#comic-file-cover-${component.comic_file.id}`)
      )
    ).toBeTruthy();
  });
});
