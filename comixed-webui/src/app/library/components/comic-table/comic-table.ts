/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
  signal
} from '@angular/core';
import { TableLazyLoadEvent, TableModule } from '@openng/optimus-ui/table';
import { Comic } from '@app/library/models/comic';
import { ComicCoverUrlPipe } from '@app/library/pipes/comic-cover-url-pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Tooltip } from '@openng/optimus-ui/tooltip';
import {
  FaIconComponent,
  IconDefinition
} from '@fortawesome/angular-fontawesome';
import { ComicState } from '@app/library/models/comic-state';
import {
  faBoltLightning,
  faCircleCheck,
  faFile,
  faPlus,
  faQuestion,
  faRotate,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { ItemSelection } from '@app/library/models/item-selection';
import { Store } from '@ngrx/store';
import {
  selectSelectedComicListBusy,
  selectSelectedComicListEntries
} from '@app/library/selectors/selected-comic-list.selectors';
import { SelectedComicListActions } from '@app/library/actions/selected-comic-list.actions';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [
    ComicCoverUrlPipe,
    TranslatePipe,
    DatePipe,
    RouterLink,
    Tooltip,
    FaIconComponent,
    TableModule,
    Checkbox,
    FormsModule
  ],
  selector: 'app-comic-table',
  styleUrl: './comic-table.scss',
  templateUrl: './comic-table.html'
})
export class ComicTable {
  @Output() loadComics = new EventEmitter<TableLazyLoadEvent>();
  readonly comicEntries = signal<Comic[]>([]);
  readonly comicListFirst = signal(0);
  readonly comicListRows = signal(10);
  readonly comicListTotalCount = signal(0);
  readonly comicListBusy = signal(false);
  readonly store = inject(Store);
  readonly selectedComicListBusy = this.store.selectSignal(
    selectSelectedComicListBusy
  );
  readonly selectedComicListEntries = this.store.selectSignal(
    selectSelectedComicListEntries
  );
  readonly tableEntries = computed<ItemSelection<Comic>[]>(() =>
    this.comicEntries().map(comic => {
      return {
        item: comic,
        selected: this.selectedComicListEntries().includes(comic.comicId)
      } as ItemSelection<Comic>;
    })
  );

  @Input() set comics(comics: Comic[]) {
    this.comicEntries.set(comics);
  }

  @Input() set first(first: number) {
    this.comicListFirst.set(first);
  }

  @Input() set rows(rows: number) {
    this.comicListRows.set(rows);
  }

  @Input() set total(total: number) {
    this.comicListTotalCount.set(total);
  }

  @Input() set busy(busy: boolean) {
    this.comicListBusy.set(busy);
  }

  onSelectComic(comic: Comic, selected: boolean) {
    this.store.dispatch(
      SelectedComicListActions.selectComic({ comic, selected })
    );
  }

  getIconForComicState(comicState: ComicState): IconDefinition {
    switch (comicState) {
      case ComicState.ADDED:
        return faPlus;
      case ComicState.DISCOVERED:
        return faFile;
      case ComicState.UNPROCESSED:
        return faBoltLightning;
      case ComicState.STABLE:
        return faCircleCheck;
      case ComicState.CHANGED:
        return faRotate;
      case ComicState.DELETED:
        return faTrash;
      default:
        return faQuestion;
    }
  }
}
