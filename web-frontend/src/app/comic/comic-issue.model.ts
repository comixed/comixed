/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Page } from './page.model';

export class ComicIssue {
  id: number;
  cover_date: string;
  cover_url: string;
  issue_number: number;
  name; string;
  volume_name: string;
  volume_id: number;

  constructor(
    id?: number,
    cover_date?: string,
    cover_url?: string,
    issue_number?: number,
    name?: string,
    volume_name?: string,
    volume_id?: number
  ) {
    this.id = id;
    this.cover_date = cover_date;
    this.cover_url = cover_url;
    this.issue_number = issue_number;
    this.name = name;
    this.volume_name = volume_name;
    this.volume_id = volume_id;
  }
}
