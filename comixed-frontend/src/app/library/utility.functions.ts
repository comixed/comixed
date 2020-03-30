/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import * as _ from 'lodash';
import { Comic } from 'app/comics/models/comic';
import { ComicCollectionEntry } from 'app/library/models/comic-collection-entry';

export function mergeComics(base: Comic[], update: Comic[]): Comic[] {
  const result = base.filter(base_entry => {
    return update.every(update_entry => update_entry.id !== base_entry.id);
  });

  return result.concat(update);
}

export function deleteComics(base: Comic[], deleted: Comic[]): Comic[] {
  return base.filter(baseEntry => {
    return (
      deleted.some(deletedEntry => deletedEntry.id === baseEntry.id) === false
    );
  });
}

function latestDateForField(comics: Comic[], field_name: string): number {
  if (!comics.length) {
    return 0;
  }

  return Math.max.apply(null, comics.map(comic => comic[field_name] || 0));
}

export function latestUpdatedDate(comics: Comic[]): number {
  return latestDateForField(comics, 'lastUpdatedDate');
}

export function latestComicAddedDate(comics: Comic[]): number {
  return latestDateForField(comics, 'added_date');
}

interface ExtractEntry {
  name: string;
  comic: Comic;
}

export function extractField(
  comics: Comic[],
  primaryFieldName: string,
  secondaryFieldName: string = null
): ComicCollectionEntry[] {
  let extractedData: ExtractEntry[] = [];

  comics.forEach(comic => {
    const primaryFieldValue = comic[primaryFieldName];
    const secondaryFieldValue = !!secondaryFieldName
      ? comic[secondaryFieldName]
      : null;
    const fieldValue = !!secondaryFieldValue
      ? secondaryFieldValue
      : primaryFieldValue;

    if (!!fieldValue && fieldValue.constructor === Array) {
      extractedData = extractedData.concat(
        fieldValue.map(value => {
          return { name: value, comic: comic } as ExtractEntry;
        })
      );
    } else {
      extractedData.push({
        name: fieldValue || '',
        comic: comic
      } as ExtractEntry);
    }
  });

  const comics_by_field = new Map<string, Comic[]>();
  extractedData.forEach(extract_entry => {
    let collection_entry: Comic[] = comics_by_field[extract_entry.name];

    if (!collection_entry) {
      collection_entry = [];
      comics_by_field[extract_entry.name] = collection_entry;
    }
    collection_entry.push(extract_entry.comic);
  });

  const result: ComicCollectionEntry[] = [];
  _.forEach(comics_by_field, (value: Comic[], key: string) => {
    result.push({
      name: key,
      count: value.length,
      comics: value,
      last_comic_added: latestComicAddedDate(value)
    });
  });
  return result;
}
