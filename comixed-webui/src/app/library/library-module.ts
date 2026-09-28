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
import { EffectsModule } from '@ngrx/effects';
import { ComicDetailEffects } from '@app/library/effects/comic-detail.effects';
import { comicDetailFeature } from '@app/library/reducers/comic-detail.reducer';
import { comicListFeature } from '@app/library/reducers/comic-list.reducer';
import { ComicListEffects } from '@app/library/effects/comic-list.effects';
import { publisherListsFeature } from '@app/library/reducers/publisher-list.reducer';
import { PublisherListEffects } from '@app/library/effects/publisher-list.effects';
import { ComicFileListEffects } from '@app/library/effects/comic-file-list.effects';
import { comicFileListsFeature } from '@app/library/reducers/comic-file-list.reducer';
import { RemoteLibraryEffects } from '@app/library/effects/remote-library.effects';
import { remoteLibraryFeature } from '@app/library/reducers/remote-library.reducer';
import { SeriesListEffects } from '@app/library/effects/series-list.effects';
import { seriesListFeature } from '@app/library/reducers/series-list.reducer';
import { publisherSeriesListsFeature } from '@app/library/reducers/publisher-series-list.reducer';
import { PublisherSeriesListEffects } from '@app/library/effects/publisher-series-list.effects';
import { PublisherComicListEffects } from '@app/library/effects/publisher-comic-list.effects';
import { publisherComicListsFeature } from '@app/library/reducers/publisher-comic-list.reducer';
import { tagListsFeature } from '@app/library/reducers/tag-list.reducer';
import { TagListEffects } from '@app/library/effects/tag-list.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(remoteLibraryFeature),
    StoreModule.forFeature(comicFileListsFeature),
    StoreModule.forFeature(publisherListsFeature),
    StoreModule.forFeature(publisherSeriesListsFeature),
    StoreModule.forFeature(publisherComicListsFeature),
    StoreModule.forFeature(seriesListFeature),
    StoreModule.forFeature(tagListsFeature),
    StoreModule.forFeature(comicDetailFeature),
    StoreModule.forFeature(comicListFeature),
    EffectsModule.forFeature([
      RemoteLibraryEffects,
      ComicFileListEffects,
      PublisherListEffects,
      PublisherSeriesListEffects,
      PublisherComicListEffects,
      SeriesListEffects,
      TagListEffects,
      ComicDetailEffects,
      ComicListEffects
    ])
  ]
})
export class LibraryModule {}
