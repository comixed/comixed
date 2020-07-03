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
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { COMIC_1 } from 'app/comics/models/comic.fixtures';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { LibraryAdaptor } from 'app/library';
import { UserExperienceModule } from 'app/user-experience/user-experience.module';
import { LoggerModule } from '@angular-ru/logger';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import {
  ContextMenuModule,
  ProgressSpinnerModule,
  TooltipModule
} from 'primeng/primeng';
import { ComicCoverComponent } from './comic-cover.component';

describe('ComicCoverComponent', () => {
  let component: ComicCoverComponent;
  let fixture: ComponentFixture<ComicCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserExperienceModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        OverlayPanelModule,
        PanelModule,
        CardModule,
        ProgressSpinnerModule,
        TooltipModule,
        ContextMenuModule
      ],
      declarations: [ComicCoverComponent, ComicCoverUrlPipe, ComicTitlePipe],
      providers: [
        MessageService,
        LibraryAdaptor,
        ComicAdaptor,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicCoverComponent);
    component = fixture.componentInstance;
    component.coverUrl = 'http://localhost/cover.png';
    component.coverSize = 200;
    component.useSameHeight = true;
    fixture.detectChanges();
  }));

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('emits an event when clicked with a comic', () => {
    component.comic = COMIC_1;
    component.clicked();
    component.click.subscribe(result => expect(result).toEqual(COMIC_1));
  });

  it('fires an event when clicked with an selected comic file', () => {
    component.comicFile = COMIC_FILE_1;
    component.clicked();
    component.click.subscribe(result => expect(result).toEqual(COMIC_FILE_1));
  });
});
