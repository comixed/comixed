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

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Comic } from '@app/library/models/comic';
import { ComicPage } from '@app/library/models/comic-page';
import { ComicTag } from '@app/library/models/comic-tag';
import { ComicMetadataSource } from '../models/comic-metadata-source';

export const ComicDetailAction = createActionGroup({
  source: 'Comic Detail',
  events: {
    Load: props<{ comicId: number }>(),
    LoadSuccess: props<{
      comic: Comic;
      pages: ComicPage[];
      tags: ComicTag[];
      metadata: ComicMetadataSource;
    }>(),
    LoadFailure: emptyProps(),
    UpdateReceived: props<{
      comic: Comic;
      pages: ComicPage[];
      tags: ComicTag[];
      metadata: ComicMetadataSource;
    }>(),
    Save: props<{ comic: Comic }>(),
    SaveSuccess: emptyProps(),
    SaveFailure: emptyProps()
  }
});
