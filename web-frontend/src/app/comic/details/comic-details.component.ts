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
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { Comic } from '../../models/comic.model';
import { Page } from '../../models/page.model';
import { ComicService } from '../../services/comic.service';
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { ReadViewerComponent } from '../read-viewer/read-viewer.component';
import { PageDetailsComponent } from '../page-details/page-details.component';
import { PageType } from '../../models/page-type.model';
import { ComicOverviewComponent } from '../../ui/components/comics/comic-overview/comic-overview.component';
import { ComicStoryComponent } from './story/comic-story/comic-story.component';
import { ComicCreditsComponent } from '../../ui/components/comic-credits/comic-credits.component';
import { ComicPagesComponent } from './pages/comic-pages/comic-pages.component';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit {
  readonly TAB_PARAMETER = 'tab';

  current_tab = 'overview';
  comic: Comic;
  title_text: string;
  subtitle_text: string;
  sub: any;
  cover_url = '';
  show_credits = false;
  show_summary = false;
  show_description = false;
  show_notes = false;
  show_characters = false;
  show_teams = false;
  show_story_arcs = false;
  show_locations = false;
  page_types: Array<PageType> = [];
  current_page: Page;
  image_size: number;
  private show_page_details = false;
  protected editing = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private user_service: UserService,
  ) { }

  ngOnInit() {
    this.image_size = parseInt(this.user_service.get_user_preference('cover_size', '200'), 10);
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
    this.activatedRoute.queryParams.subscribe(params => {
      this.set_current_tab(params[this.TAB_PARAMETER] || 'overview');
    });
    this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.comic_service.load_comic_from_remote(id).subscribe(
        (comic: Comic) => {
          this.alert_service.show_busy_message('');
          if (comic) {
            this.comic = comic;
            this.load_comic_details();
          } else {
            this.alert_service.show_error_message(`No such comic: id=${id}`, null);
            this.router.navigateByUrl('/');
          }
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

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  load_comic_details(): void {
    this.cover_url = '';
    this.title_text = '';
    this.subtitle_text = '';
    if (this.comic) {
      this.cover_url = this.comic_service.get_url_for_page_by_comic_index(this.comic.id, 0);
      this.title_text = this.comic_service.get_issue_label_text_for_comic(this.comic);
      this.subtitle_text = this.comic_service.get_issue_content_label_for_comic(this.comic);
    }
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

  get_cover_url(): string {
    if (this.comic) {
      return this.comic_service.get_cover_url_for_comic(this.comic);
    }

    return '';
  }

  is_current_tab(name: string): boolean {
    return this.current_tab === name;
  }

  set_current_tab(name: string): void {
    this.current_tab = name;
    this.update_params(this.TAB_PARAMETER, name);
  }

  update_comic(event): void {
    this.comic = event;
    this.load_comic_details();
  }
}
