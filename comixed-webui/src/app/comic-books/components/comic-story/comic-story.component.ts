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
import {
  ComicTagType,
  CreditTags
} from '@app/comic-books/models/comic-tag-type';
import { ComicTag } from '@app/comic-books/models/comic-tag';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { ComicDetailCardComponent } from '../comic-detail-card/comic-detail-card.component';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';

@Component({
  selector: 'cx-comic-story',
  templateUrl: './comic-story.component.html',
  styleUrls: ['./comic-story.component.scss'],
  imports: [
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    ComicDetailCardComponent,
    RouterLink,
    TranslateModule
  ]
})
export class ComicStoryComponent {
  credits: ComicTag[] = [];
  characters: ComicTag[] = [];
  teams: ComicTag[] = [];
  locations: ComicTag[] = [];
  stories: ComicTag[] = [];

  private _comicBook: DisplayableComic;

  get comic(): DisplayableComic {
    return this._comicBook;
  }

  @Input() set comic(comic: DisplayableComic) {
    this._comicBook = comic;
  }

  @Input() set tags(tags: ComicTag[]) {
    this.credits = this.getTags(tags, CreditTags);
    this.characters = this.getTags(tags, [ComicTagType.CHARACTER]);
    this.teams = this.getTags(tags, [ComicTagType.TEAM]);
    this.locations = this.getTags(tags, [ComicTagType.LOCATION]);
    this.stories = this.getTags(tags, [ComicTagType.STORY]);
  }

  private getTags(tags: ComicTag[], allowed: ComicTagType[]): ComicTag[] {
    return tags
      .filter(tag => allowed.includes(tag.type))
      .sort((left, right) => left.type.localeCompare(right.type));
  }
}
