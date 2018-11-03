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

import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ComicService } from '../../services/comic.service';
import { AlertService } from '../../services/alert.service';
import { FileDetails } from '../file-details.model';

@Component({
  selector: 'app-import-comic-list-entry',
  templateUrl: './import-comic-list-entry.component.html',
  styleUrls: ['./import-comic-list-entry.component.css']
})
export class ImportComicListEntryComponent implements OnInit {
  @Input() file_details: FileDetails;
  @Input() cover_size: number;
  @Output() clicked = new EventEmitter<FileDetails>();
  @Output() selected = new EventEmitter<boolean>();
  file_size: string;
  cover_url: string;
  page_count: number;
  title_text: string;
  subtitle_text: string;

  constructor(
    private comic_service: ComicService,
    private alert_service: AlertService,
  ) { }

  ngOnInit() {
    this.cover_url = this.comic_service.get_cover_url_for_file(this.file_details.filename);
    this.file_size = (this.file_details.size / (1024 ** 2)).toPrecision(3).toLocaleLowerCase();

    this.title_text = this.file_details.base_filename;
    this.subtitle_text = `${(this.file_details.size / 1024 ** 2).toFixed(2)} Mb`;
  }

  toggle_selected(event: any): void {
    this.selected.next(this.file_details.selected === false);
    event.preventDefault();
  }

  on_clicked(event: any): void {
    this.clicked.next(this.file_details);
    event.preventDefault();
  }
}
