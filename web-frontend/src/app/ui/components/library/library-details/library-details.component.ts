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
import { Router } from '@angular/router';
import { Comic } from '../../../../models/comic.model';

@Component({
  selector: 'app-library-details',
  templateUrl: './library-details.component.html',
  styleUrls: ['./library-details.component.css']
})
export class LibraryDetailsComponent implements OnInit {
  @Input() comics: Array<Comic>;
  @Input() title_search: string;
  @Input() group_by: number;
  @Input() sort_order: number;
  @Input() page_size: number;
  @Input() current_page: number;
  @Output() selected: EventEmitter<Comic> = new EventEmitter<Comic>();

  constructor(
    private router: Router,
  ) { }

  ngOnInit() { }

  show_comic(comic: Comic): void {
    this.router.navigate(['/comics', comic.id]);
  }

  clicked(comic: Comic): void {
    this.selected.next(comic);
    event.preventDefault();
  }

}
