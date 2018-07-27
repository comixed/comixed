/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {ReadViewerComponent} from '../read-viewer/read-viewer.component';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit, OnDestroy {
  comic: Comic;
  sub: any;
  cover_url = '';
  show_characters = false;
  show_teams = false;
  show_story_arcs = false;
  show_locations = false;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private comicService: ComicService) {}

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.comicService.getComic(id).subscribe(
        (comic: Comic) => {
          this.comic = comic;
          this.cover_url = this.comicService.getImageUrl(this.comic.id, 0);
        },
        error => {
          console.log('error:', error.message);
        }
      );
    },
      error => {
        console.log('error:', error);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getImageURL(page_id: number): string {
    return this.comicService.getImageUrlForId(page_id);
  }

  getDownloadLink(): string {
    return this.comicService.getComicDownloadLink(this.comic.id);
  }
}
