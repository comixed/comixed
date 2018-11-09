/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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
} from '@angular/core';
import { Comic } from '../../comic.model';
import { LibraryCoverEntryComponent } from '../library-cover-entry/library-cover-entry.component';

@Component({
  selector: 'app-library-covers',
  templateUrl: './library-covers.component.html',
  styleUrls: ['./library-covers.component.css']
})
export class LibraryCoversComponent implements OnInit {
  @Input() comics: Array<Comic> = [];
  @Input() cover_size: number;
  @Input() title_search: string;
  @Input() group_by: number;
  @Input() sort_order: number;
  @Input() page_size: number;
  @Input() current_page: number;

  constructor() { }

  ngOnInit() {
  }

  handle_comic_clicked(event): void {
  }
}
