/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import {
  METADATA_SOURCE_LIST_FEATURE_KEY,
  reducer as metadataSourceListReducer
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MetadataSourceListEffects } from '@app/comic-metadata/effects/metadata-source-list.effects';
import { TranslateModule } from '@ngx-translate/core';
import {
  METADATA_SOURCE_FEATURE_KEY,
  reducer as metadataSourceReducer
} from '@app/comic-metadata/reducers/metadata-source.reducer';
import { MetadataSourceEffects } from '@app/comic-metadata/effects/metadata-source.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(
      METADATA_SOURCE_LIST_FEATURE_KEY,
      metadataSourceListReducer
    ),
    StoreModule.forFeature(METADATA_SOURCE_FEATURE_KEY, metadataSourceReducer),
    EffectsModule.forFeature([MetadataSourceListEffects, MetadataSourceEffects])
  ],
  exports: [CommonModule]
})
export class ComicMetadataModule {}
