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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ComicAdaptor } from 'app/comics/adaptors/comic.adaptor';
import { COMIC_1 } from 'app/comics/comics.fixtures';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { LibraryAdaptor } from 'app/library';
import { LibraryEffects } from 'app/library/effects/library.effects';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { UserService } from 'app/services/user.service';
import { UserExperienceModule } from 'app/user-experience/user-experience.module';
import { LoggerModule } from '@angular-ru/logger';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule, TooltipModule } from 'primeng/primeng';
import { ComicGridItemComponent } from './comic-grid-item.component';

describe('ComicGridItemComponent', () => {
  let component: ComicGridItemComponent;
  let fixture: ComponentFixture<ComicGridItemComponent>;

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
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
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
      providers: [
        UserService,
        MessageService,
        LibraryAdaptor,
        ComicAdaptor,
        ConfirmationService
      ]
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
