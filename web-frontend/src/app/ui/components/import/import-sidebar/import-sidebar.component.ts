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

import {
  Component,
  OnInit,
  Input,
  Output,
} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-import-sidebar',
  templateUrl: './import-sidebar.component.html',
  styleUrls: ['./import-sidebar.component.css']
})
export class ImportSidebarComponent implements OnInit {
  @Input() show_sidebar: boolean;
  @Input() directory: string;
  @Input() disable_inputs: boolean;
  @Input() any_selected: boolean;
  @Output() loadFiles: EventEmitter<string> = new EventEmitter<string>();
  @Output() comicsPerPage: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectAll: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() import: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteBlockedPages: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() showSelectionsOnly: EventEmitter<boolean> = new EventEmitter<boolean>();

  protected delete_blocked_pages = false;
  protected show_selections_only = false;

  constructor() { }

  ngOnInit() {
    this.directory = this.directory || '';
  }

  find_comics(): void {
    this.loadFiles.next(this.directory);
  }

  set_page_size(size: any): void {
    this.comicsPerPage.next(parseInt(size.target.value, 10));
  }

  toggle_select_all(event: any): void {
    this.selectAll.next(this.any_selected === false);
  }

  on_import(): void {
    this.import.next(true);
  }

  toggle_delete_blocked_pages(value: boolean): void {
    this.deleteBlockedPages.next(value);
  }

  toggle_show_selections_only(value: boolean): void {
    this.showSelectionsOnly.next(value);
  }
}
