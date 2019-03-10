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
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { libraryReducer } from '../../../../reducers/library.reducer';
import { libraryDisplayReducer } from '../../../../reducers/library-display.reducer';
import { multipleComicsScrapingReducer } from '../../../../reducers/multiple-comics-scraping.reducer';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { BlockUIModule } from 'primeng/blockui';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { InplaceModule } from 'primeng/inplace';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { ScrapingComicListComponent } from '../../../components/scraping/scraping-comic-list/scraping-comic-list.component';
import { MultipleComicScrapingComponent } from '../../../components/scraping/multiple-comic-scraping/multiple-comic-scraping.component';
import { ComicDetailsEditorComponent } from '../../../components/comic/comic-details-editor/comic-details-editor.component';
import { VolumeListComponent } from '../../../components/scraping/volume-list/volume-list.component';
import { ComicCoverUrlPipe } from '../../../../pipes/comic-cover-url.pipe';
import { MultiComicScrapingPageComponent } from './multi-comic-scraping-page.component';

xdescribe('MultiComicScrapingPageComponent', () => {
  let component: MultiComicScrapingPageComponent;
  let fixture: ComponentFixture<MultiComicScrapingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({
          library: libraryReducer,
          library_display: libraryDisplayReducer,
          multiple_comic_scraping: multipleComicsScrapingReducer
        }),
        ScrollPanelModule,
        ButtonModule,
        DataViewModule,
        CardModule,
        BlockUIModule,
        TooltipModule,
        ProgressBarModule,
        InplaceModule,
        SplitButtonModule,
        TableModule
      ],
      declarations: [
        MultiComicScrapingPageComponent,
        ScrapingComicListComponent,
        MultipleComicScrapingComponent,
        ComicDetailsEditorComponent,
        VolumeListComponent,
        ComicCoverUrlPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiComicScrapingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
