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

import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-import-toolbar',
  templateUrl: './import-toolbar.component.html',
  styleUrls: ['./import-toolbar.component.css']
})
export class ImportToolbarComponent implements OnInit {
  @Output() directorySelected = new EventEmitter<string>();
  @Output() showSelections = new EventEmitter<boolean>();
  @Output() selectAll = new EventEmitter<boolean>();
  @Output() import = new EventEmitter<boolean>();

  protected select_options: MenuItem[];

  protected directory: string;

  constructor() {
    this.select_options = [
      { label: 'All', icon: 'fas fa-folder-plus', command: () => { this.set_select_all_files(true); } },
      { label: 'None', icon: 'fas fa-trash-alt', command: () => { this.set_select_all_files(false); } },
    ];
  }

  ngOnInit() {
  }

  directory_selected(): void {
    this.directorySelected.next(this.directory);
  }

  show_selections(): void {
    this.showSelections.next(true);
  }

  set_select_all_files(select: boolean): void {
    this.selectAll.next(select);
  }

  start_importing(): void {
    this.import.next(true);
  }
}
