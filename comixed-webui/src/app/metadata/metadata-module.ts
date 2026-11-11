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

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(metadataSourceListsFeature),
    StoreModule.forFeature(singleComicScrapingsFeature),
    EffectsModule.forFeature([
      MetadataSourceListEffects,
      SingleComicScrapingEffects
    ])
  ]
})
export class MetadataModule {}
