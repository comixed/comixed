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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
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
import { ScrapingComicListComponent } from 'app/ui/components/scraping/scraping-comic-list/scraping-comic-list.component';
import { MultipleComicScrapingComponent } from 'app/ui/components/scraping/multiple-comic-scraping/multiple-comic-scraping.component';
import { ComicDetailsEditorComponent } from 'app/comics/components/comic-details-editor/comic-details-editor.component';
import { VolumeListComponent } from 'app/comics/components/volume-list/volume-list.component';
import { ComicCoverUrlPipe } from 'app/comics/pipes/comic-cover-url.pipe';
import { MultiComicScrapingPageComponent } from './multi-comic-scraping-page.component';
import { ScrapingIssueTitlePipe } from 'app/comics/pipes/scraping-issue-title.pipe';
import { REDUCERS } from 'app/app.reducers';
import { LibraryModule } from 'app/library/library.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EffectsModule } from '@ngrx/effects';
import { EFFECTS } from 'app/app.effects';
import { ComicService } from 'app/services/comic.service';
import { UserService } from 'app/services/user.service';
import { MessageService } from 'primeng/api';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { RouterTestingModule } from '@angular/router/testing';

describe('MultiComicScrapingPageComponent', () => {
  let component: MultiComicScrapingPageComponent;
  let fixture: ComponentFixture<MultiComicScrapingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LibraryModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(REDUCERS),
        EffectsModule.forRoot(EFFECTS),
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
        ComicCoverUrlPipe,
        ScrapingIssueTitlePipe
      ],
      providers: [BreadcrumbAdaptor, ComicService, UserService, MessageService]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiComicScrapingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
