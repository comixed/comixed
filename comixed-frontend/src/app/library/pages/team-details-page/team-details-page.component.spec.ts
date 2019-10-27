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
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { DataViewModule } from 'primeng/dataview';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CardModule } from 'primeng/card';
import { LibraryFilterComponent } from 'app/library/components/library-filter/library-filter.component';
import { ComicListComponent } from 'app/library/components/comic-list/comic-list.component';
import { ComicGridItemComponent } from 'app/library/components/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from 'app/library/components/comic-list-item/comic-list-item.component';
import { TeamDetailsPageComponent } from './team-details-page.component';
import { REDUCERS } from 'app/app.reducers';
import {
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  MessageService,
  ProgressSpinnerModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationAdaptor } from 'app/user';
import {
  COMIC_1,
  ComicCollectionEntry,
  LibraryAdaptor,
  LibraryDisplayAdaptor,
  ReadingListAdaptor,
  SelectionAdaptor
} from 'app/library';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { ComicListToolbarComponent } from 'app/library/components/comic-list-toolbar/comic-list-toolbar.component';
import { ComicsModule } from 'app/comics/comics.module';
import { ComicFilterPipe } from 'app/library/pipes/comic-filter.pipe';
import { FilterAdaptor } from 'app/library/adaptors/filter.adaptor';

describe('TeamDetailsPageComponent', () => {
  const TEAM_NAME = 'Team One';
  const COMIC = { ...COMIC_1, teams: [TEAM_NAME] };
  const TEAMS: ComicCollectionEntry[] = [
    {
      name: TEAM_NAME,
      comics: [COMIC],
      last_comic_added: 0,
      count: 1
    }
  ];

  let component: TeamDetailsPageComponent;
  let fixture: ComponentFixture<TeamDetailsPageComponent>;
  let library_adaptor: LibraryAdaptor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ComicsModule,
        HttpClientTestingModule,
        EffectsModule.forRoot(EFFECTS),
        BrowserAnimationsModule,
        RouterTestingModule,
        FormsModule,
        StoreModule.forRoot(REDUCERS),
        TranslateModule.forRoot(),
        DataViewModule,
        SplitButtonModule,
        ScrollPanelModule,
        SidebarModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        OverlayPanelModule,
        CardModule,
        ConfirmDialogModule,
        ContextMenuModule,
        TooltipModule,
        ToolbarModule,
        ProgressSpinnerModule
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryAdaptor,
        FilterAdaptor,
        LibraryDisplayAdaptor,
        SelectionAdaptor,
        ReadingListAdaptor,
        BreadcrumbAdaptor,
        ConfirmationService,
        MessageService,
        UserService,
        ComicService
      ],
      declarations: [
        TeamDetailsPageComponent,
        LibraryFilterComponent,
        ComicListComponent,
        ComicGridItemComponent,
        ComicListItemComponent,
        ComicListToolbarComponent,
        ComicFilterPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    library_adaptor = TestBed.get(LibraryAdaptor);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
