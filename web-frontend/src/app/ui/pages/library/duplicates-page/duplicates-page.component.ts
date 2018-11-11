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
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { ComicService } from '../../../../services/comic.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-duplicates-page',
  templateUrl: './duplicates-page.component.html',
  styleUrls: ['./duplicates-page.component.css']
})
export class DuplicatesPageComponent implements OnInit {
  readonly ROWS_PARAMETER = 'rows';
  readonly COVER_PARAMETER = 'coversize';

  protected duplicate_hashes: Array<string>;

  protected rows_options: Array<SelectItem>;
  protected rows: number;

  protected cover_size: number;

  constructor(
    private comic_service: ComicService,
    private user_service: UserService,
    private activated_route: ActivatedRoute,
    private router: Router,
  ) {
    activated_route.queryParams.subscribe(params => {
      this.rows = this.load_parameter(params[this.ROWS_PARAMETER], 10);
      this.cover_size = this.load_parameter(params[this.COVER_PARAMETER],
        parseInt(this.user_service.get_user_preference('cover_size', '200'), 10));
    });

    this.rows_options = [
      { label: '10 comics', value: 10 },
      { label: '25 comics', value: 25 },
      { label: '50 comics', value: 50 },
      { label: '100 comics', value: 100 },
    ];
  }

  ngOnInit() {
    this.comic_service.get_duplicate_page_hashes().subscribe(
      (hashes: Array<string>) => {
        this.duplicate_hashes = hashes;
      });
  }

  private update_params(name: string, value: string): void {
    const queryParams: Params = Object.assign({}, this.activated_route.snapshot.queryParams);
    if (value && value.length) {
      queryParams[name] = value;
    } else {
      queryParams[name] = null;
    }
    this.router.navigate([], { relativeTo: this.activated_route, queryParams: queryParams });
  }

  private load_parameter(value: string, defvalue: any): any {
    if (value && value.length) {
      return parseInt(value, 10);
    }
    return defvalue;
  }

  get_url_for_hash(hash: string): string {
    return this.comic_service.get_url_for_page_by_hash(hash);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.update_params(this.ROWS_PARAMETER, `${this.rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.update_params(this.COVER_PARAMETER, `${this.cover_size}`);
  }
}
