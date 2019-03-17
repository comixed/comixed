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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { libraryDisplayReducer } from '../../../../reducers/library-display.reducer';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { PanelModule } from 'primeng/panel';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InplaceModule } from 'primeng/inplace';
import { ProgressBarModule } from 'primeng/progressbar';
import { BlockUIModule } from 'primeng/blockui';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { MultipleComicScrapingComponent } from '../../scraping/multiple-comic-scraping/multiple-comic-scraping.component';
import { ScrapingComicListComponent } from '../../scraping/scraping-comic-list/scraping-comic-list.component';
import { LibraryFilterComponent } from '../library-filter/library-filter.component';
import { ComicDetailsEditorComponent } from '../../comic/comic-details-editor/comic-details-editor.component';
import { VolumeListComponent } from '../../scraping/volume-list/volume-list.component';
import { ComicCoverUrlPipe } from '../../../../pipes/comic-cover-url.pipe';
import { DEFAULT_LIBRARY_DISPLAY } from '../../../../models/actions/library-display.fixtures';
import { DEFAULT_LIBRARY_FILTER } from '../../../../models/actions/library-filter.fixtures';
import { ComicListToolbarComponent } from './comic-list-toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ComicListToolbarComponent', () => {
  let component: ComicListToolbarComponent;
  let fixture: ComponentFixture<ComicListToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({ library_display: libraryDisplayReducer }),
        ScrollPanelModule,
        ButtonModule,
        SliderModule,
        CheckboxModule,
        DropdownModule,
        CardModule,
        DataViewModule,
        PanelModule,
        SplitButtonModule,
        InplaceModule,
        ProgressBarModule,
        BlockUIModule,
        TooltipModule,
        TableModule
      ],
      declarations: [
        ComicListToolbarComponent,
        MultipleComicScrapingComponent,
        ScrapingComicListComponent,
        LibraryFilterComponent,
        ComicDetailsEditorComponent,
        VolumeListComponent,
        ComicCoverUrlPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicListToolbarComponent);
    component = fixture.componentInstance;
    component.library_display = DEFAULT_LIBRARY_DISPLAY;
    component.library_filter = DEFAULT_LIBRARY_FILTER;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
