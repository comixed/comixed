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
import { ComicFile } from '@app/library/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { setComicFilesSelectedState } from '@app/library/actions/comic-import.actions';

@Component({
  selector: 'cx-comic-file-details',
  templateUrl: './comic-file-details.component.html',
  styleUrls: ['./comic-file-details.component.scss']
})
export class ComicFileDetailsComponent implements OnInit {
  @Input() file: ComicFile;
  @Input() selected: boolean;

  constructor(private logger: LoggerService, private store: Store<any>) {}

  ngOnInit(): void {}

  onSelectFile(selected: boolean): void {
    this.logger.debug(
      `${selected ? 'Selecting' : 'Deselecting'} current file:`,
      this.file
    );
    this.store.dispatch(
      setComicFilesSelectedState({ files: [this.file], selected })
    );
  }
}
