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
} from '@angular/core';
import { Comic } from '../../../../models/comic.model';
import { ComicCredit } from '../../../../models/comic-credit.model';

@Component({
  selector: 'app-comic-credits',
  templateUrl: './comic-credits.component.html',
  styleUrls: ['./comic-credits.component.css']
})
export class ComicCreditsComponent implements OnInit {
  @Input() comic: Comic;

  constructor() { }

  ngOnInit() {
  }

  sort_credits(): Array<ComicCredit> {
    return this.comic.credits.sort((left: ComicCredit, right: ComicCredit) => {
      if (left.role < right.role) {
        return -1;
      }

      if (left.role > right.role) {
        return 1;
      }

      if (left.name < right.name) {
        return -1;
      }
      if (left.name > right.name) {
        return 1;
      }

      return 0;
    });
  }
}
