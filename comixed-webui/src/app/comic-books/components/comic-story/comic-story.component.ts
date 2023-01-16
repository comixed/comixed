/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, Input } from '@angular/core';
import { ComicBook } from '@app/comic-books/models/comic-book';
import {
  ComicTagType,
  CreditTags
} from '@app/comic-books/models/comic-tag-type';
import { ComicTag } from '@app/comic-books/models/comic-tag';

@Component({
  selector: 'cx-comic-story',
  templateUrl: './comic-story.component.html',
  styleUrls: ['./comic-story.component.scss']
})
export class ComicStoryComponent {
  credits: ComicTag[] = [];
  characters: ComicTag[] = [];
  teams: ComicTag[] = [];
  locations: ComicTag[] = [];
  stories: ComicTag[] = [];

  private _comicBook: ComicBook;

  get comic(): ComicBook {
    return this._comicBook;
  }

  @Input() set comic(comic: ComicBook) {
    this._comicBook = comic;
    this.credits = this.getTags(comic.detail.tags, CreditTags);
    this.characters = this.getTags(comic.detail.tags, [ComicTagType.CHARACTER]);
    this.teams = this.getTags(comic.detail.tags, [ComicTagType.TEAM]);
    this.locations = this.getTags(comic.detail.tags, [ComicTagType.LOCATION]);
    this.stories = this.getTags(comic.detail.tags, [ComicTagType.STORY]);
  }

  private getTags(tags: ComicTag[], allowed: ComicTagType[]): ComicTag[] {
    return tags.filter(tag => allowed.includes(tag.type));
  }
}
