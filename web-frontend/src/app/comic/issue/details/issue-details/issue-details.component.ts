/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-issue-details',
  templateUrl: './issue-details.component.html',
  styleUrls: ['./issue-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class IssueDetailsComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() cover_url: string;
  @Output() close = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() { }

  close_details(): void {
    this.close.next(true);
  }
}
