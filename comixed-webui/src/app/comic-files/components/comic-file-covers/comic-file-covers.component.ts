/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Component, Input, OnInit } from '@angular/core';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';

@Component({
  selector: 'cx-comic-file-covers',
  templateUrl: './comic-file-covers.component.html',
  styleUrls: ['./comic-file-covers.component.scss']
})
export class ComicFileCoversComponent implements OnInit {
  @Input() files: ComicFile[] = [];
  @Input() selectedFiles: ComicFile[] = [];

  constructor(private logger: LoggerService, private store: Store<any>) {}

  ngOnInit(): void {}

  isFileSelected(file: ComicFile): boolean {
    return this.selectedFiles.includes(file);
  }
}
