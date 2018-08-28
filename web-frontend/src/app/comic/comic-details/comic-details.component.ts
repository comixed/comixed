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

import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';

import {Comic} from '../comic.model';
import {Page} from '../page.model';
import {ComicService} from '../comic.service';
import {AlertService} from '../../alert.service';
import {ReadViewerComponent} from '../read-viewer/read-viewer.component';
import {PageDetailsComponent} from '../page-details/page-details.component';
import {PageType} from '../page-type.model';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit, OnDestroy {
  comic: Comic;
  title_text: string;
  subtitle_text: string;
  sub: any;
  cover_url = '';
  show_summary = false;
  show_notes = false;
  show_characters = false;
  show_teams = false;
  show_story_arcs = false;
  show_locations = false;
  page_types: Array<PageType> = [];
  current_page: Page;
  private show_page_details = false;
  protected editing = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comic_service: ComicService,
    private alert_service: AlertService,
  ) {}

  ngOnInit() {
    this.alert_service.show_busy_message('Retrieving comic details...');
    this.comic_service.get_page_types().subscribe(
      (page_types: PageType[]) => {
        this.page_types = page_types;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to retrieve page types...', error);
      }
    );
    this.comic_service.current_page.subscribe(
      (page: Page) => {
        this.current_page = page;
        this.show_page_details = true;
      }
    );
    this.sub = this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.comic_service.load_comic_from_remote(id).subscribe(
        (comic: Comic) => {
          this.comic = comic;
          if (this.comic) {
            this.cover_url = this.comic_service.get_url_for_page_by_comic_index(this.comic.id, 0);
            this.title_text = this.comic_service.get_issue_label_text_for_comic(this.comic);
            this.subtitle_text = this.comic_service.get_issue_content_label_for_comic(this.comic);
          }
          this.alert_service.show_busy_message('');
        },
        error => {
          this.alert_service.show_error_message('Error while retrieving comic...', error);
          this.alert_service.show_busy_message('');
        }
      );
    },
      error => {
        this.alert_service.show_error_message('An error has occurred...', error);
        this.alert_service.show_busy_message('');
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  get_story_arc_badge_text(): string {
    return `${(this.comic.story_arcs || []).length}`;
  }

  has_notes(): boolean {
    return this.comic.notes && this.comic.notes.length > 0;
  }

  has_characters(): boolean {
    return (this.comic.characters || []).length > 0;
  }

  has_teams(): boolean {
    return (this.comic.teams || []).length > 0;
  }

  has_story_arcs(): boolean {
    return this.comic.story_arcs && this.comic.story_arcs.length > 0;
  }

  has_locations(): boolean {
    return (this.comic.locations || []).length > 0;
  }

  page_is_cover(page: Page): boolean {
    return this.comic.pages[0].id === page.id;
  }

  getImageURL(page_id: number): string {
    return this.comic_service.get_url_for_page_by_id(page_id);
  }

  getDownloadLink(): string {
    return this.comic_service.get_download_link_for_comic(this.comic.id);
  }

  start_editing(): void {
    this.editing = true;
  }

  stop_editing(): void {
    this.editing = false;
  }
}
