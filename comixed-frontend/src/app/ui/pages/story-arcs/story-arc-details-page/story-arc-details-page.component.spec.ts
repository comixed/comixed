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
import { AppState } from '../../../../app.state';
import { libraryDisplayReducer } from '../../../../reducers/library-display.reducer';
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
import { SelectedComicsListComponent } from '../../../components/library/selected-comics-list/selected-comics-list.component';
import { LibraryFilterComponent } from '../../../components/library/library-filter/library-filter.component';
import { ComicListComponent } from '../../../components/library/comic-list/comic-list.component';
import { ComicGridItemComponent } from '../../../components/library/comic-grid-item/comic-grid-item.component';
import { ComicListItemComponent } from '../../../components/library/comic-list-item/comic-list-item.component';
import { ComicListToolbarComponent } from '../../../components/library/comic-list-toolbar/comic-list-toolbar.component';
import { ComicCoverComponent } from '../../../components/comic/comic-cover/comic-cover.component';
import { ComicStoriesPipe } from '../../../../pipes/comic-stories.pipe';
import { ComicCoverUrlPipe } from '../../../../pipes/comic-cover-url.pipe';
import { ComicTitlePipe } from '../../../../pipes/comic-title.pipe';
import { StoryArcDetailsPageComponent } from './story-arc-details-page.component';

describe('StoryArcDetailsPageComponent', () => {
  let component: StoryArcDetailsPageComponent;
  let fixture: ComponentFixture<StoryArcDetailsPageComponent>;
  let store: Store<AppState>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        FormsModule,
        StoreModule.forRoot({ library_display: libraryDisplayReducer }),
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
        CardModule
      ],
      declarations: [
        StoryArcDetailsPageComponent,
        SelectedComicsListComponent,
        LibraryFilterComponent,
        ComicListComponent,
        ComicGridItemComponent,
        ComicListItemComponent,
        ComicListToolbarComponent,
        ComicCoverComponent,
        ComicStoriesPipe,
        ComicCoverUrlPipe,
        ComicTitlePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryArcDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
