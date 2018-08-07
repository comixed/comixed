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

import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';

import {Comic} from '../comic.model';
import {Page} from '../page.model';
import {ComicService} from '../comic.service';
import {ErrorsService} from '../../errors.service';
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
  sub: any;
  cover_url = '';
  show_characters = false;
  show_teams = false;
  show_story_arcs = false;
  show_locations = false;
  page_types: Array<PageType> = [];
  current_page: Page;
  private show_page_details = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comic_service: ComicService,
    private error_service: ErrorsService,
  ) {}

  ngOnInit() {
    this.comic_service.get_page_types().subscribe(
      (page_types: PageType[]) => {
        this.page_types = page_types;
      },
      (error: Error) => {
        this.error_service.fireErrorMessage(error.message);
        console.log('ERROR:', error);
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
          this.cover_url = this.comic_service.get_url_for_page_by_comic_index(this.comic.id, 0);
        },
        error => {
          console.log('error:', error.message);
        }
      );
    },
      error => {
        console.log('error:', error);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getImageURL(page_id: number): string {
    return this.comic_service.geturl_for_page_by_id(page_id);
  }

  getDownloadLink(): string {
    return this.comic_service.get_download_link_for_comic(this.comic.id);
  }
}
