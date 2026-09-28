/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, Input, signal } from '@angular/core';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel
} from '@openng/optimus-ui/accordion';
import { TranslatePipe } from '@ngx-translate/core';
import { Comic, NO_COMIC } from '@app/library/models/comic';
import { ComicTag } from '@app/library/models/comic-tag';
import { Badge } from '@openng/optimus-ui/badge';
import { StoryDetailCard } from '@app/library/components/story-detail-card/story-detail-card';

const NON_CREDIT_TAGS = ['CHARACTER', 'TEAM', 'LOCATION', 'STORY'];

@Component({
  imports: [
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    TranslatePipe,
    Badge,
    StoryDetailCard
  ],
  selector: 'app-comic-story-detail',
  styleUrl: './comic-story-detail.scss',
  templateUrl: './comic-story-detail.html'
})
export class ComicStoryDetail {
  readonly comicDetail = signal(NO_COMIC);
  readonly characterTags = signal<ComicTag[]>([]);
  readonly teamTags = signal<ComicTag[]>([]);
  readonly locationTags = signal<ComicTag[]>([]);
  readonly storyTags = signal<ComicTag[]>([]);
  readonly creditTags = signal<ComicTag[]>([]);

  @Input() set comic(comic: Comic) {
    this.comicDetail.set(comic);
  }

  @Input() set tags(tags: ComicTag[]) {
    this.characterTags.set(tags.filter(entry => entry.type === 'CHARACTER'));
    this.teamTags.set(tags.filter(entry => entry.type === 'TEAM'));
    this.locationTags.set(tags.filter(entry => entry.type === 'LOCATION'));
    this.storyTags.set(tags.filter(entry => entry.type === 'STORY'));
    this.creditTags.set(
      tags.filter(entry => !NON_CREDIT_TAGS.includes(entry.type))
    );
  }
}
