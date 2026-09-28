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
import { Card } from '@openng/optimus-ui/card';

@Component({
  imports: [Card],
  selector: 'app-story-detail-card',
  styleUrl: './story-detail-card.scss',
  templateUrl: './story-detail-card.html'
})
export class StoryDetailCard {
  readonly cardType = signal('');
  readonly cardValue = signal('');
  readonly cardLink = signal('');

  @Input() set type(type: string) {
    this.cardType.set(type);
  }

  @Input() set value(value: string) {
    this.cardValue.set(value);
  }

  @Input() set link(link: string) {
    this.cardLink.set(link);
  }
}
