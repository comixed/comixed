/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrapingIssueDetailComponent } from './components/scraping-issue-detail/scraping-issue-detail.component';
import { StoreModule } from '@ngrx/store';
import {
  reducer as scrapingReducer,
  SCRAPING_FEATURE_KEY
} from './reducers/scraping.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ScrapingEffects } from './effects/scraping.effects';
import { ScrapingRouting } from './scraping.routing';
import { ScrapingPageComponent } from '@app/scraping/pages/scraping-page/scraping-page.component';
import { ComicModule } from '@app/comic/comic.module';
import { LibraryModule } from '@app/library/library.module';
import { ComicScrapingComponent } from '@app/library/components/comic-scraping/comic-scraping.component';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    ScrapingPageComponent,
    ScrapingIssueDetailComponent,
    ComicScrapingComponent
  ],
  imports: [
    CommonModule,
    ScrapingRouting,
    StoreModule.forFeature(SCRAPING_FEATURE_KEY, scrapingReducer),
    EffectsModule.forFeature([ScrapingEffects]),
    ComicModule,
    LibraryModule,
    MatCardModule,
    MatTooltipModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatTableModule
  ],
  exports: [CommonModule]
})
export class ScrapingModule {}
