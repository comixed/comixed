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

export const ComicRemovalActions = createActionGroup({
  source: 'Comic Removal',
  events: {
    MarkOneForRemoval: props<{ comic: Comic }>(),
    MarkOneForRemovalSuccess: emptyProps(),
    MarkOneForRemovalFailure: emptyProps(),
    UnmarkOneForRemoval: props<{ comic: Comic }>(),
    UnmarkOneForRemovalSuccess: emptyProps(),
    UnmarkOneForRemovalFailure: emptyProps(),
    MarkSelectionsForRemoval: emptyProps(),
    MarkSelectionsForRemovalSuccess: emptyProps(),
    MarkSelectionsForRemovalFailure: emptyProps(),
    UnmarkSelectionsForRemoval: emptyProps(),
    UnmarkSelectionsForRemovalSuccess: emptyProps(),
    UnmarkSelectionsForRemovalFailure: emptyProps()
  }
});
