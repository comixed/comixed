/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comic, LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-story-arc-details-page',
  templateUrl: './story-arc-details-page.component.html',
  styleUrls: ['./story-arc-details-page.component.css']
})
export class StoryArcDetailsPageComponent implements OnInit, OnDestroy {
  stories_subscription: Subscription;
  comics: Comic[];
  selected_comics_subscription: Subscription;
  selected_comics: Comic[];

  protected layout = 'grid';
  protected sort_field = 'volume';
  protected rows = 10;
  protected same_height = true;
  protected cover_size = 200;

  story_name: string;

  constructor(
    private title_service: Title,
    private translate_service: TranslateService,
    private library_adaptor: LibraryAdaptor,
    private selection_adaptor: SelectionAdaptor,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.story_name = params['name'];
    });
  }

  ngOnInit() {
    this.stories_subscription = this.library_adaptor.story_arc$.subscribe(
      stories => {
        const story = stories.find(entry => entry.name === this.story_name);
        this.comics = story ? story.comics : [];
        this.title_service.setTitle(
          this.translate_service.instant('story-arc-details-page.title', {
            name: this.story_name,
            count: this.comics.length
          })
        );
      }
    );
    this.selected_comics_subscription = this.selection_adaptor.comic_selection$.subscribe(
      selected_comics => (this.selected_comics = selected_comics)
    );
  }

  ngOnDestroy() {
    this.stories_subscription.unsubscribe();
    this.selected_comics_subscription.unsubscribe();
  }

  set_layout(dataview: any, layout: string): void {
    dataview.changeLayout(layout);
  }

  set_sort_field(sort_field: string): void {
    this.sort_field = sort_field;
  }

  set_rows(rows: number): void {
    this.rows = rows;
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
  }

  set_same_height(same_height: boolean): void {
    this.same_height = same_height;
  }
}
