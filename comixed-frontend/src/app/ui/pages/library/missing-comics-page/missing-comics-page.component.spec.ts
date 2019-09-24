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

import { MissingComicsPageComponent } from './missing-comics-page.component';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { MissingComicsPipe } from 'app/pipes/missing-comics.pipe';
import { ComicListComponent } from 'app/ui/components/library/comic-list/comic-list.component';
import { DataViewModule } from 'primeng/dataview';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import {
  CardModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  DropdownModule,
  MessageService,
  OverlayPanelModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule
} from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { REDUCERS } from 'app/app.reducers';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';

describe('MissingComicsPageComponent', () => {
  let component: MissingComicsPageComponent;
  let fixture: ComponentFixture<MissingComicsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        EffectsModule.forRoot(EFFECTS),
        RouterTestingModule,
        FormsModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(REDUCERS),
        TranslateModule.forRoot(),
        DataViewModule,
        SidebarModule,
        SplitButtonModule,
        ScrollPanelModule,
        DropdownModule,
        CheckboxModule,
        SliderModule,
        PanelModule,
        OverlayPanelModule,
        CardModule,
        ConfirmDialogModule,
        ContextMenuModule
      ],
      declarations: [
        MissingComicsPageComponent,
        ComicListComponent,
        MissingComicsPipe,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        LibraryFilterComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe,
        ComicCoverComponent
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
        ConfirmationService,
        MessageService,
        UserService,
        ComicService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MissingComicsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
