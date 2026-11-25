/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { StoreModule } from '@ngrx/store';
import { singleComicScrapingsFeature } from '@app/metadata/reducers/single-comic-scraping.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SingleComicScrapingEffects } from '@app/metadata/effects/single-comic-scraping.effects';
import { metadataSourceListsFeature } from '@app/metadata/reducers/metadata-source-list.reducer';
import { MetadataSourceListEffects } from '@app/metadata/effects/metadata-source-list.effects';
import { scrapeFilenameFeature } from '@app/metadata/reducers/scrape-filename.reducer';
import { ScrapeFilenameEffects } from '@app/metadata/effects/scrape-filename.effects';
import { multiComicScrapingFeature } from '@app/metadata/reducers/multi-comic-scraping.reducer';
import { MultiComicScrapingEffects } from '@app/metadata/effects/multi-comic-scraping.effects';
import { filenameScrapingRuleListsFeature } from '@app/metadata/reducers/filename-scraping-rule-list.reducer';
import { FilenameScrapingRuleListEffects } from '@app/metadata/effects/filename-scraping-rule-list.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(metadataSourceListsFeature),
    StoreModule.forFeature(singleComicScrapingsFeature),
    StoreModule.forFeature(multiComicScrapingFeature),
    StoreModule.forFeature(filenameScrapingRuleListsFeature),
    StoreModule.forFeature(scrapeFilenameFeature),
    EffectsModule.forFeature([
      MetadataSourceListEffects,
      SingleComicScrapingEffects,
      MultiComicScrapingEffects,
      FilenameScrapingRuleListEffects,
      ScrapeFilenameEffects
    ])
  ]
})
export class MetadataModule {}
