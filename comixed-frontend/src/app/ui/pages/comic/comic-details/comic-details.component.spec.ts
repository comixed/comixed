/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { libraryReducer } from 'app/reducers/library.reducer';
import { singleComicScrapingReducer } from 'app/reducers/single-comic-scraping.reducer';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { InplaceModule } from 'primeng/inplace';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { DataViewModule } from 'primeng/dataview';
import { SplitButtonModule } from 'primeng/splitbutton';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ComicOverviewComponent } from 'app/ui/components/comic/comic-overview/comic-overview.component';
import { ComicStoryComponent } from 'app/ui/components/comic/comic-story/comic-story.component';
import { ComicReaderComponent } from 'app/ui/components/comic/comic-reader/comic-reader.component';
import { ComicCreditsComponent } from 'app/ui/components/comic/comic-credits/comic-credits.component';
import { ComicPagesComponent } from 'app/ui/components/comic/comic-pages/comic-pages.component';
import { ComicDetailsEditorComponent } from 'app/ui/components/comic/comic-details-editor/comic-details-editor.component';
import { ComicGroupingCardComponent } from 'app/ui/components/comic/comic-grouping-card/comic-grouping-card.component';
import { VolumeListComponent } from 'app/ui/components/scraping/volume-list/volume-list.component';
import { ComicService } from 'app/services/comic.service';
import { ComicServiceMock } from 'app/services/comic.service.mock';
import { ComicTitlePipe } from 'app/pipes/comic-title.pipe';
import { ComicCoverUrlPipe } from 'app/pipes/comic-cover-url.pipe';
import { ComicPageUrlPipe } from 'app/pipes/comic-page-url.pipe';
import { SINGLE_COMIC_SCRAPING_STATE } from 'app/models/scraping/single-comic-scraping.fixtures';
import { ComicDetailsComponent } from './comic-details.component';

describe('ComicDetailsComponent', () => {
  let component: ComicDetailsComponent;
  let fixture: ComponentFixture<ComicDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({
          library: libraryReducer,
          single_comic_scraping: singleComicScrapingReducer
        }),
        TabViewModule,
        CardModule,
        InplaceModule,
        DropdownModule,
        PanelModule,
        DataViewModule,
        SplitButtonModule,
        BlockUIModule,
        ProgressBarModule,
        TooltipModule,
        TableModule
      ],
      declarations: [
        ComicDetailsComponent,
        ComicOverviewComponent,
        ComicStoryComponent,
        ComicReaderComponent,
        ComicCreditsComponent,
        ComicPagesComponent,
        ComicDetailsEditorComponent,
        ComicGroupingCardComponent,
        VolumeListComponent,
        ComicTitlePipe,
        ComicCoverUrlPipe,
        ComicPageUrlPipe
      ],
      providers: [{ provide: ComicService, useClass: ComicServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ComicDetailsComponent);
    component = fixture.componentInstance;
    component.single_comic_scraping = SINGLE_COMIC_SCRAPING_STATE;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
