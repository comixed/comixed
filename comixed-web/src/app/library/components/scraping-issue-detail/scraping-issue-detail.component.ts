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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ScrapingIssue } from '@app/library/models/scraping-issue';
import { LoggerService } from '@angular-ru/logger';

@Component({
  selector: 'cx-scraping-issue-detail',
  templateUrl: './scraping-issue-detail.component.html',
  styleUrls: ['./scraping-issue-detail.component.scss']
})
export class ScrapingIssueDetailComponent implements OnInit {
  @Input() pageSize: number;
  @Input() issue: ScrapingIssue;

  @Output() decision = new EventEmitter<boolean>();

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {}

  onSelect(): void {
    this.logger.trace('Selecting scraping issue');
    this.decision.emit(true);
  }

  onReject(): void {
    this.logger.trace('Rejecting scraping issue');
    this.decision.emit(false);
  }
}
