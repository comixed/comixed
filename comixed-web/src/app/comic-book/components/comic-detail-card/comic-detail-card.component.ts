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
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import { filter } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';
import { Comic } from '@app/comic-book/models/comic';
import { ComicContextMenuEvent } from '@app/comic-book/models/ui/comic-context-menu-event';
import { ComicSelectEvent } from '@app/comic-book/models/event/comic-select-event';
import { UpdateComicInfoEvent } from '@app/comic-book/models/event/update-comic-info-event';

@Component({
  selector: 'cx-comic-detail-card',
  templateUrl: './comic-detail-card.component.html',
  styleUrls: ['./comic-detail-card.component.scss']
})
export class ComicDetailCardComponent implements OnInit, OnDestroy {
  @Input() comic: Comic;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() imageUrl: string;
  @Input() description: string;
  @Input() detailLink: string;
  @Input() imageWidth = 'auto';
  @Input() imageHeight = '100%';
  @Input() busy = false;
  @Input() blurred = false;
  @Input() selected = false;
  @Input() comicChanged = false;

  @Output() selectionChanged = new EventEmitter<ComicSelectEvent>();
  @Output() showContextMenu = new EventEmitter<ComicContextMenuEvent>();
  @Output() updateComicInfo = new EventEmitter<UpdateComicInfoEvent>();

  displayOptionSubscription: Subscription;

  constructor(private logger: LoggerService, private store: Store<any>) {
    this.displayOptionSubscription = this.store
      .select(selectDisplayState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.imageWidth = `${state.pageSize}px`;
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.displayOptionSubscription.unsubscribe();
  }

  onCoverClicked(): void {
    // only respond to the click if the details are for a comic
    if (!!this.comic) {
      this.logger.trace('Comic cover clicked');
      this.selectionChanged.emit({
        comic: this.comic,
        selected: !this.selected
      });
    }
  }

  onContextMenu($event: MouseEvent): void {
    $event.preventDefault();
    this.logger.trace('Showing context menu for comic:', this.comic);
    this.showContextMenu.emit({
      comic: this.comic,
      x: `${$event.clientX}px`,
      y: `${$event.clientY}px`
    } as ComicContextMenuEvent);
  }

  onUpdateComicInfo(comic: Comic): void {
    this.logger.trace('Firing update comic info event:', comic);
    this.updateComicInfo.emit({ comic });
  }
}
