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
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
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
import { LibraryFilterComponent } from 'app/ui/components/library/library-filter/library-filter.component';
import { ComicListComponent } from 'app/ui/components/library/comic-list/comic-list.component';
import { ComicGridItemComponent } from 'app/ui/components/library/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from 'app/ui/components/library/comic-list-item/comic-list-item.component';
import { ComicListToolbarComponent } from 'app/ui/components/library/comic-list-toolbar/comic-list-toolbar.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { TeamDetailsPageComponent } from './team-details-page.component';
import { REDUCERS } from 'app/app.reducers';
import {
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  MessageService
} from 'primeng/primeng';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { LibraryModule } from 'app/library/library.module';
import { UserService } from 'app/services/user.service';
import { ComicService } from 'app/services/comic.service';
import { ComicCoverComponent } from 'app/comics/components/comic-cover/comic-cover.component';
import { COMIC_1, ComicCollectionEntry, LibraryAdaptor } from 'app/library';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

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
        LibraryModule,
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
        ContextMenuModule
      ],
      providers: [
        AuthenticationAdaptor,
        LibraryDisplayAdaptor,
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
        ComicCoverComponent,
        ComicCoverUrlPipe,
        ComicTitlePipe
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

  describe('when a team update is received', () => {
    it('sets the comics when the team is found', () => {
      component.teamName = TEAM_NAME;
      library_adaptor._team$.next(TEAMS);
      fixture.detectChanges();
      expect(component.comics).toEqual([COMIC]);
    });

    it('sets an empty set when the team is not found', () => {
      component.teamName = TEAM_NAME.substr(1);
      library_adaptor._team$.next(TEAMS);
      fixture.detectChanges();
      expect(component.comics).toEqual([]);
    });
  });
});
