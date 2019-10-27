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
import { MissingComicsPipe } from 'app/library/pipes/missing-comics.pipe';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { DataViewModule } from 'primeng/dataview';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
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
  ProgressSpinnerModule,
  ScrollPanelModule,
  SidebarModule,
  SliderModule,
  SplitButtonModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { LibraryFilterComponent } from 'app/library/components/library-filter/library-filter.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationAdaptor } from 'app/user';
import {
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ComicListToolbarComponent } from 'app/library/components/comic-list-toolbar/comic-list-toolbar.component';
import {
  LIBRARY_FEATURE_KEY,
  reducer
} from 'app/library/reducers/library.reducer';
import { LibraryEffects } from 'app/library/effects/library.effects';
import { ComicsModule } from 'app/comics/comics.module';
import { ComicFilterPipe } from 'app/library/pipes/comic-filter.pipe';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';

describe('MissingComicsPageComponent', () => {
  let component: MissingComicsPageComponent;
  let fixture: ComponentFixture<MissingComicsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(LIBRARY_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([LibraryEffects]),
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
        ContextMenuModule,
        TooltipModule,
        ToolbarModule,
        ProgressSpinnerModule
      ],
      declarations: [
        MissingComicsPageComponent,
        ComicListComponent,
        MissingComicsPipe,
        ComicListToolbarComponent,
        ComicListItemComponent,
        ComicGridItemComponent,
        LibraryFilterComponent,
        ComicFilterPipe
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryAdaptor,
        FilterAdaptor,
        SelectionAdaptor,
        ReadingListAdaptor,
        LibraryDisplayAdaptor,
        BreadcrumbAdaptor,
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
