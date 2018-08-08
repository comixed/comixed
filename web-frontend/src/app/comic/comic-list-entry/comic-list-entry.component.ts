/*
 * ComixEd - A digital comic book library management application.
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

import {Component, OnInit, Input} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {AlertService} from '../../alert.service';
import {ComicListComponent} from '../comic-list/comic-list.component';

@Component({
  selector: 'app-comic-list-entry',
  templateUrl: './comic-list-entry.component.html',
  styleUrls: ['./comic-list-entry.component.css']
})

export class ComicListEntryComponent implements OnInit {
  @Input() comic: Comic;
  cover_url: string;
  title_text: string;
  subtitle_text: string;
  delete_comic_title: string;
  delete_comic_message: string;
  @Input() selected: boolean;
  confirm_button = 'Yes';
  cancel_button = 'No!';

  constructor(
    protected router: Router,
    protected comic_service: ComicService,
    protected error_service: AlertService,
    protected comicList: ComicListComponent,
  ) {
  }

  ngOnInit() {
    this.cover_url = this.comic.missing ? '/assets/img/missing.png' : this.comic_service.get_url_for_page_by_comic_index(this.comic.id, 0);
    this.title_text = this.comic.series || 'Unknown Series';
    if (this.comic.issue_number) {
      this.title_text = this.title_text + ' #' + this.comic.issue_number;
    }

    this.subtitle_text = 'Volume ' + this.comic.volume || 'Unknown';

    this.delete_comic_title = `Delete ${this.title_text}`;
    this.delete_comic_message = 'Are you sure you want to delete this comic?';
  }

  clicked(event: any): void {
    this.comic_service.set_current_comic(this.comic);
    event.preventDefault();
  }

  openComic(): void {
    this.router.navigate(['/comics', this.comic.id]);
  }

  deleteComic(): void {
    this.comic_service.remove_comic_from_library(this.comic).subscribe(
      success => {
        if (success) {
          this.comic_service.remove_comic_from_local(this.comic.id);
        }
      },
      (error: any) => {
        this.error_service.show_error_message('Failed to delete comic from the library...', error);
      }
    );
  }
}
