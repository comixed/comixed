/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

export class Comic {
  id: number;
  filename: string;
  publisher: string;
  series: string;
  volume: string;
  issue_number: string;
  title: string;
  story_arcs: string[];
  description: string;
  notes: string;
  summary: string;
  missing: boolean;
  archive_type: string;
  comic_vine_id: string;
  comic_vine_url: string;
  added_date: string;
  cover_date: string;
  last_read_date: string;
  page_count: number;
  characters: string[];
  teams: string[];
  locations: string[];
  pages: any[];

  constructor(
    id?: number,
    filename?: string,
    publisher?: string,
    series?: string,
    volume?: string,
    issue_number?: string,
    title?: string,
    story_arcs?: string[],
    description?: string,
    notes?: string,
    summary?: string,
    missing?: boolean,
    archive_type?: string,
    comic_vine_id?: string,
    comic_vine_url?: string,
    added_date?: string,
    cover_date?: string,
    last_read_date?: string,
    page_count?: number,
    characters?: string[],
    teams?: string[],
    locations?: string[],
    pages?: any[],
  ) {
    this.id = id;
    this.filename = filename;
    this.publisher = publisher;
    this.series = series;
    this.volume = volume;
    this.issue_number = issue_number;
    this.title = title;
    this.story_arcs = story_arcs;
    this.description = description;
    this.notes = notes;
    this.summary = summary;
    this.missing = missing;
    this.archive_type = archive_type;
    this.comic_vine_id = comic_vine_id;
    this.comic_vine_url = comic_vine_url;
    this.added_date = added_date;
    this.cover_date = cover_date;
    this.last_read_date = last_read_date;
    this.page_count = page_count;
    this.characters = characters;
    this.teams = teams;
    this.locations = locations;
    this.pages = pages;
  }
}
