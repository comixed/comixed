/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { Comic } from '../../comic.model';
import { ComicService } from '../../../services/comic.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-comic-list-entry',
  templateUrl: './comic-list-entry.component.html',
  styleUrls: ['./comic-list-entry.component.css']
})

export class ComicListEntryComponent implements OnInit {
  @Input() comic: Comic;
  @Input() cover_size: number;
  @Input() selected: boolean;
  @Input() sort_order: Observable<number>;
  cover_url: string;
  title_text: string;
  subtitle_text: string;
  delete_comic_title: string;
  delete_comic_message: string;
  confirm_button = 'Yes';
  cancel_button = 'No!';

  constructor(
    protected router: Router,
    protected comic_service: ComicService,
    protected alert_service: AlertService,
  ) { }

  ngOnInit() {
    this.cover_url = this.comic.missing ? '/assets/img/missing.png' : this.comic_service.get_url_for_page_by_comic_index(this.comic.id, 0);
    this.title_text = this.comic.series || 'Unknown Series';
    if (this.comic.issue_number) {
      this.title_text = this.title_text + ' #' + this.comic.issue_number;
    }

    this.delete_comic_title = `Delete ${this.title_text}`;
    this.delete_comic_message = 'Are you sure you want to delete this comic?';

    this.title_text = `${this.comic.series || 'Unknown'} #${this.comic.issue_number || '???'}`;
    this.set_subtitle();
  }

  set_subtitle() {
    this.sort_order.subscribe(
      (sort_order: number) => {
        switch (sort_order) {
          case 0: this.subtitle_text = `(v.${this.comic.volume || 'Unknown'})`; break;
          case 1: this.subtitle_text = `Added: ${this.format_date_full(this.comic.added_date, 'This should never happen...')}`; break;
          case 2: this.subtitle_text = `Cover date: ${this.format_date_month_year(this.comic.cover_date, 'Unknown')}`; break;
          case 3: this.subtitle_text = `Last read: ${this.format_date_full(this.comic.last_read_date, 'Never')}`; break;
          default: this.subtitle_text = `Invalid sort value: ${this.sort_order}`;
        }
      });
  }

  format_date_month_year(date: string, otherwise: string): string {
    return this.format_date(date, otherwise, { month: 'short', year: 'numeric' });
  }

  format_date_full(date: string, otherwise: string): string {
    return this.format_date(date, otherwise, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  format_date(date: string, otherwise: string, options: any): string {
    if (date) {
      const formatter = new Intl.DateTimeFormat('en-us', options);

      return formatter.format(new Date(date));
    }

    return otherwise;
  }

  clicked(event: any): void {
    this.comic_service.set_current_comic(this.comic);
    event.preventDefault();
  }

  open_comic(): void {
    this.router.navigate(['/comics', this.comic.id]);
  }

  delete_comic(): void {
    this.comic_service.remove_comic_from_library(this.comic).subscribe(
      success => {
        if (success) {
          this.comic_service.remove_comic_from_local(this.comic.id);
        }
      },
      (error: any) => {
        this.alert_service.show_error_message('Failed to delete comic from the library...', error);
      }
    );
  }

  toggle_selected(): void {
    this.selected = !this.selected;
  }
}
