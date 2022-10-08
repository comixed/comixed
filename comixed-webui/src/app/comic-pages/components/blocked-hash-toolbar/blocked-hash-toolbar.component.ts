/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  Output,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { PAGE_SIZE_DEFAULT } from '@app/library/library.constants';

@Component({
  selector: 'cx-blocked-hash-toolbar',
  templateUrl: './blocked-hash-toolbar.component.html',
  styleUrls: ['./blocked-hash-toolbar.component.scss']
})
export class BlockedHashToolbarComponent {
  @ViewChild('MatPagination') paginator: MatPaginator;

  @Input() hasSelections = false;
  @Input() pageSize = PAGE_SIZE_DEFAULT;

  @Output() markSelected = new EventEmitter<void>();
  @Output() clearSelected = new EventEmitter<void>();
  @Output() deleteSelected = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<File>();
  @Output() downloadFile = new EventEmitter<void>();

  constructor() {}
}
