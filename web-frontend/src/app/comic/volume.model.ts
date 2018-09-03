/*
 * ComiXed - A digital comic book library management application.
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

export class Volume {
  id: number;
  name: string;
  issue_count: number;
  image_url: string;
  start_year: number;
  publisher: string;

  contstructor(
    id?: number,
    name?: string,
    issue_count?: number,
    image_url?: string,
    start_year?: number,
    publisher?: string,
  ) {
    this.id = id;
    this.name = name;
    this.issue_count = issue_count;
    this.image_url = image_url;
    this.start_year = start_year;
    this.publisher = publisher;
  }
}
