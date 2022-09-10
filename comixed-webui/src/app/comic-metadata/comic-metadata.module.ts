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
import { MetadataProcessPageComponent } from './pages/metadata-process-page/metadata-process-page.component';
import { ComicMetadataRouting } from '@app/comic-metadata/comic-metadata.routing';
import { MetadataProcessToolbarComponent } from './components/metadata-process-toolbar/metadata-process-toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MetadataProcessStatusComponent } from './components/metadata-process-status/metadata-process-status.component';
import {
  METADATA_UPDATE_PROCESS_FEATURE_KEY,
  reducer as metadataUpdateProcessReducer
} from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import { MetadataUpdateProcessEffects } from '@app/comic-metadata/effects/metadata-update-process.effects';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LibraryModule } from '@app/library/library.module';

@NgModule({
  declarations: [
    MetadataProcessPageComponent,
    MetadataProcessToolbarComponent,
    MetadataProcessStatusComponent
  ],
  imports: [
    CommonModule,
    ComicMetadataRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(
      METADATA_SOURCE_LIST_FEATURE_KEY,
      metadataSourceListReducer
    ),
    StoreModule.forFeature(METADATA_SOURCE_FEATURE_KEY, metadataSourceReducer),
    StoreModule.forFeature(
      METADATA_UPDATE_PROCESS_FEATURE_KEY,
      metadataUpdateProcessReducer
    ),
    EffectsModule.forFeature([
      MetadataSourceListEffects,
      MetadataSourceEffects,
      MetadataUpdateProcessEffects
    ]),
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    LibraryModule
  ],
  exports: [CommonModule]
})
export class ComicMetadataModule {}
