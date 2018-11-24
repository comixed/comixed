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

import { Component, OnInit, Input } from '@angular/core';
import { ComicService } from '../../../../services/comic.service';
import { ComicFile } from '../../../../models/import/comic-file';

@Component({
  selector: 'app-file-details-cover',
  templateUrl: './file-details-cover.component.html',
  styleUrls: ['./file-details-cover.component.css']
})
export class FileDetailsCoverComponent implements OnInit {
  @Input() file_details: ComicFile;
  @Input() width: string;
  @Input() height: string;

  constructor(
    private comic_service: ComicService,
  ) { }

  ngOnInit() {
  }

  get_cover_url(file: ComicFile): string {
    return this.comic_service.get_cover_url_for_file(file.filename);
  }
}
