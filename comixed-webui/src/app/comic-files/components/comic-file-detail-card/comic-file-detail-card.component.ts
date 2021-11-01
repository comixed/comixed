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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { setComicFilesSelectedState } from '@app/comic-files/actions/comic-file-list.actions';
import { ComicFileContextMenuEvent } from '@app/comic-files/model/ui/comic-file-context-menu-event';

export const CARD_WIDTH_PADDING = 20;

@Component({
  selector: 'cx-comic-file-detail-card',
  templateUrl: './comic-file-detail-card.component.html',
  styleUrls: ['./comic-file-detail-card.component.scss']
})
export class ComicFileDetailCardComponent implements OnInit, OnDestroy {
  @Input() file: ComicFile;
  @Input() selected = false;

  @Output() showContextMenu = new EventEmitter<ComicFileContextMenuEvent>();

  constructor(private logger: LoggerService, private store: Store<any>) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  onSelectFile(): void {
    const selected = this.selected === false;
    this.logger.debug('Toggling selected:', selected);
    this.store.dispatch(
      setComicFilesSelectedState({ files: [this.file], selected })
    );
  }

  onContextMenu(mouseEvent: MouseEvent): void {
    mouseEvent.preventDefault();
    this.logger.trace('Showing context menu for comic file:', this.file);
    this.showContextMenu.emit({
      file: this.file,
      x: `${mouseEvent.clientX}px`,
      y: `${mouseEvent.clientY}px`
    });
  }
}
