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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { AlertService } from '../../../../services/alert.service';
import { ComicService } from '../../../../services/comic.service';
import { Comic } from '../../../../models/comic.model';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit {
  readonly TAB_PARAMETER = 'tab';

  comic: Comic;
  protected current_tab: number;
  protected title: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alert_service: AlertService,
    private comic_service: ComicService,
  ) {
    activatedRoute.queryParams.subscribe(params => {
      this.current_tab = this.load_parameter(params[this.TAB_PARAMETER], 0);
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.comic_service.load_comic_from_remote(id).subscribe(
        (comic: Comic) => {
          this.alert_service.show_busy_message('');
          if (comic) {
            this.comic = comic;
          } else {
            this.alert_service.show_error_message(`No such comic: id=${id}`, null);
            this.router.navigateByUrl('/');
          }
        },
        error => {
          this.alert_service.show_error_message('Error while retrieving comic...', error);
          this.alert_service.show_busy_message('');
        },
        () => {
          this.load_comic_details();
        });
    });

  }

  get_cover_url(): string {
    return this.comic_service.get_cover_url_for_comic(this.comic);
  }

  set_current_tab(current_tab: number): void {
    this.current_tab = current_tab;
    this.update_params(this.TAB_PARAMETER, `${this.current_tab}`);
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: queryParams });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }

  load_comic_details(): void {
    this.title = `${this.comic.series || 'Unknown'} ` +
      `(v${this.comic.volume || this.comic.volume || '????'}) ` +
      `#${this.comic.issue_number || '??'}`;
  }
}

