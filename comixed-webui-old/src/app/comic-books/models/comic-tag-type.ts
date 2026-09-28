/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

export enum ComicTagType {
  PUBLISHER = 'PUBLISHER',
  SERIES = 'SERIES',
  CHARACTER = 'CHARACTER',
  TEAM = 'TEAM',
  LOCATION = 'LOCATION',
  STORY = 'STORY',
  WRITER = 'WRITER',
  EDITOR = 'EDITOR',
  PENCILLER = 'PENCILLER',
  INKER = 'INKER',
  COLORIST = 'COLORIST',
  LETTERER = 'LETTERER',
  COVER = 'COVER',
  OTHER = 'OTHER'
}

export const CreditTags = [
  ComicTagType.WRITER,
  ComicTagType.EDITOR,
  ComicTagType.PENCILLER,
  ComicTagType.INKER,
  ComicTagType.COLORIST,
  ComicTagType.LETTERER,
  ComicTagType.COVER,
  ComicTagType.OTHER
];

export function comicTagTypeFromString(key: string): ComicTagType {
  switch (key) {
    case 'publishers':
      return ComicTagType.PUBLISHER;
    case 'series':
      return ComicTagType.SERIES;
    case 'characters':
      return ComicTagType.CHARACTER;
    case 'locations':
      return ComicTagType.LOCATION;
    case 'stories':
      return ComicTagType.STORY;
    case 'teams':
      return ComicTagType.TEAM;
  }
  return null;
}
