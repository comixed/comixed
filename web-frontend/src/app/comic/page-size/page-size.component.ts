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

import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-page-size',
  templateUrl: './page-size.component.html',
  styleUrls: ['./page-size.component.css']
})
export class PageSizeComponent {
  @Input() initial: number;

  protected page_sizes: any[] = [
    { id: 10, label: '10 comics' },
    { id: 25, label: '25 comics' },
    { id: 50, label: '50 comics' },
    { id: 100, label: '100 comics' }
  ];

  constructor() { }
}
