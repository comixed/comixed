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

import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';

export function topEntries(
  entries: RemoteLibrarySegment[],
  maximum: number
): RemoteLibrarySegment[] {
  const topNames = Array.from(entries)
    .sort((left, right) => left.count - right.count)
    .reverse()
    .slice(0, maximum)
    .map(entry => entry.name);
  return Array.from(entries)
    .filter(entry => topNames.includes(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
}
