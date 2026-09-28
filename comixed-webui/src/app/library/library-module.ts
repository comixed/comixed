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

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(publisherListsFeature),
    StoreModule.forFeature(comicDetailFeature),
    StoreModule.forFeature(comicListFeature),
    EffectsModule.forFeature([
      PublisherListEffects,
      ComicDetailEffects,
      ComicListEffects
    ])
  ]
})
export class LibraryModule {}
