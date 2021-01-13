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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import { filter } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';

@Component({
  selector: 'cx-comic-detail-card',
  templateUrl: './comic-detail-card.component.html',
  styleUrls: ['./comic-detail-card.component.scss']
})
export class ComicDetailCardComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() imageUrl: string;
  @Input() description: string;
  @Input() detailLink: string;
  @Input() imageWidth = 'auto';
  @Input() imageHeight = '100%';
  @Input() busy = false;
  @Input() blurred = false;
  @Input() selected = false;

  displayOptionSubscription: Subscription;

  constructor(private logger: LoggerService, private store: Store<any>) {
    this.displayOptionSubscription = this.store
      .select(selectDisplayState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.imageWidth = `${state.pageSize}px`;
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.displayOptionSubscription.unsubscribe();
  }
}
