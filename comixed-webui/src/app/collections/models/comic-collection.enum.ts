/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

export enum TagType {
  CHARACTERS = 'characters',
  LOCATIONS = 'locations',
  PUBLISHERS = 'publishers',
  SERIES = 'series',
  STORIES = 'stories',
  TEAMS = 'teams'
}

export function tagTypeFromString(key: string): TagType {
  switch (key) {
    case 'characters':
      return TagType.CHARACTERS;
    case 'locations':
      return TagType.LOCATIONS;
    case 'publishers':
      return TagType.PUBLISHERS;
    case 'series':
      return TagType.SERIES;
    case 'stories':
      return TagType.STORIES;
    case 'teams':
      return TagType.TEAMS;
  }
  return null;
}
