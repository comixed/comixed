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
import { MetadataSource } from '@app/settings/models/metadata-source';

export const MetadataSourceListActions = createActionGroup({
  source: 'Metadata Source List',
  events: {
    SetSelected: props<{ selected: MetadataSource }>(),
    Load: emptyProps(),
    LoadSuccess: props<{ entries: MetadataSource[] }>(),
    LoadFailure: emptyProps(),
    Save: props<{ source: MetadataSource }>(),
    SaveSuccess: props<{ entries: MetadataSource[] }>(),
    SaveFailure: emptyProps()
  }
});
