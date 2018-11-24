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
import { AlertService } from '../../../../services/alert.service';
import { DuplicatePage } from '../../../../models/duplicate-page';

@Component({
  selector: 'app-duplicates-page',
  templateUrl: './duplicates-page.component.html',
  styleUrls: ['./duplicates-page.component.css']
})
export class DuplicatesPageComponent implements OnInit {
  readonly ROWS_PARAMETER = 'rows';
  readonly COVER_PARAMETER = 'coversize';

  protected pages: Array<DuplicatePage>;
  hashes: Array<string>;
  protected pages_by_hash: Map<string, DuplicatePage>;

  rows_options: Array<SelectItem>;
  rows: number;

  cover_size: number;

  busy = false;

  constructor(
    private comic_service: ComicService,
    private user_service: UserService,
    private alert_service: AlertService,
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
    this.comic_service.get_duplicate_pages().subscribe(
      (pages: Array<DuplicatePage>) => {
        this.pages = pages;
        this.hashes = [];
        this.pages_by_hash = new Map<string, DuplicatePage>();
        this.pages.forEach((page: DuplicatePage) => {
          if (!this.hashes.includes(page.hash)) {
            this.hashes.push(page.hash);
            this.pages_by_hash[page.hash] = [];
          }
          this.pages_by_hash[page.hash].push(page);
        });
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
    const page = this.pages_by_hash[hash][0];
    return this.comic_service.get_url_for_page_by_id(page.id);
  }

  set_rows(rows: number): void {
    this.rows = rows;
    this.update_params(this.ROWS_PARAMETER, `${this.rows}`);
  }

  set_cover_size(cover_size: number): void {
    this.cover_size = cover_size;
    this.update_params(this.COVER_PARAMETER, `${this.cover_size}`);
  }

  any_pages_deleted(hash: string): boolean {
    return this.pages_by_hash[hash].every((page: DuplicatePage) => {
      return !page.deleted;
    });
  }

  delete_all_pages(hash: string): void {
    this.busy = true;
    this.comic_service.delete_all_pages_for_hash(hash).subscribe(
      (count: number) => {
        this.pages_by_hash[hash].forEach((page: DuplicatePage) => {
          page.deleted = true;
        });
        this.alert_service.show_info_message(`Marked ${count} page(s) as deleted...`);
        this.busy = false;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to delete pages...', error);
        this.busy = false;
      });
  }

  undelete_all_pages(hash: string): void {
    this.busy = true;
    this.comic_service.undelete_all_pages_for_hash(hash).subscribe(
      (count: number) => {
        this.pages_by_hash[hash].forEach((page: DuplicatePage) => {
          page.deleted = false;
        });
        this.alert_service.show_info_message(`Unmarked ${count} page(s) as deleted...`);
        this.busy = false;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to undelete pages...', error);
        this.busy = false;
      });
  }

  is_blocked(hash: string): boolean {
    return this.pages_by_hash[hash].every((page: DuplicatePage) => {
      return page.blocked;
    });
  }

  block_page_hash(hash: string): void {
    this.busy = true;
    this.comic_service.block_page(hash).subscribe(
      () => {
        this.pages_by_hash[hash].forEach((page: DuplicatePage) => {
          page.blocked = true;
        });
        this.alert_service.show_info_message('Blocked pages like this...');
        this.busy = false;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to block pages like this...', error);
        this.busy = false;
      });
  }

  unblock_page_hash(hash: string): void {
    this.busy = true;
    this.comic_service.unblock_page(hash).subscribe(
      () => {
        this.pages_by_hash[hash].forEach((page: DuplicatePage) => {
          page.blocked = false;
        });
        this.alert_service.show_info_message('Unblocked pages like this...');
        this.busy = false;
      },
      (error: Error) => {
        this.alert_service.show_error_message('Failed to unblock pages like this...', error);
        this.busy = false;
      });
  }
}
