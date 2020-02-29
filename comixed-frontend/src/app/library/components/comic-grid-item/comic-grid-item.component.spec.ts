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
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ComicGridItemComponent } from './comic-grid-item.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'app/services/user.service';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule, TooltipModule } from 'primeng/primeng';
import { COMIC_1 } from 'app/comics/comics.fixtures';

describe('ComicGridItemComponent', () => {
  let component: ComicGridItemComponent;
  let fixture: ComponentFixture<ComicGridItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        OverlayPanelModule,
        PanelModule,
        CardModule,
        ProgressSpinnerModule,
        TooltipModule
      ],
      declarations: [
        ComicGridItemComponent,
        ComicCoverComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ],
      providers: [UserService, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicGridItemComponent);
    component = fixture.componentInstance;
    component.comic = COMIC_1;
    component.useSameHeight = true;
    component.coverSize = 640;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
