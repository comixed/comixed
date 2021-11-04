/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comic } from '@app/comic-books/models/comic';
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import {
  LOAD_COMIC_URL,
  LOAD_COMICS_URL,
  UPDATE_COMIC_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import { LoadComicsRequest } from '@app/comic-books/models/net/load-comics-request';
import {
  MARK_COMICS_DELETED_URL,
  MARK_COMICS_UNDELETED_URL,
  MARK_PAGES_DELETED_URL,
  MARK_PAGES_UNDELETED_URL
} from '@app/comic-books/comic-books.constants';
import { MarkComicsDeletedRequest } from '@app/comic-books/models/net/mark-comics-deleted-request';
import { Page } from '@app/comic-books/models/page';
import { MarkPagesDeletedRequest } from '@app/comic-books/models/network/mark-pages-deleted-request';

@Injectable({
  providedIn: 'root'
})
export class ComicService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads a batch of comics.
   *
   * @param args.lastId the last id received
   */
  loadBatch(args: { lastId: number }): Observable<any> {
    this.logger.trace('Service: loading a batch of comics:', args);
    return this.http.post(interpolate(LOAD_COMICS_URL), {
      lastId: args.lastId
    } as LoadComicsRequest);
  }

  /**
   * Loads a single comic.
   *
   * @param args.id the comic id
   */
  loadOne(args: { id: number }): Observable<any> {
    this.logger.trace('Service: loading one comic:', args);
    return this.http.get(interpolate(LOAD_COMIC_URL, { id: args.id }));
  }

  /**
   * Updates a single comic.
   *
   * @param args.comic the comic
   */
  updateOne(args: { comic: Comic }): Observable<any> {
    this.logger.trace('Service: updating one comic:', args);
    return this.http.put(
      interpolate(UPDATE_COMIC_URL, { id: args.comic.id }),
      args.comic
    );
  }

  /**
   * Updates the deleted state for a set of comic.
   *
   * @param args.comics the comics
   * @param args.deleted the deleted state
   */
  markComicsDeleted(args: {
    comics: Comic[];
    deleted: boolean;
  }): Observable<any> {
    const ids = args.comics.map(comic => comic.id);
    if (args.deleted) {
      this.logger.trace('Service: marking comics for deletion:', args.comics);
      return this.http.post(interpolate(MARK_COMICS_DELETED_URL), {
        ids
      } as MarkComicsDeletedRequest);
    } else {
      this.logger.trace('Service: unmarking comics for deletion:', args.comics);
      return this.http.post(interpolate(MARK_COMICS_UNDELETED_URL), {
        ids
      } as MarkComicsDeletedRequest);
    }
  }

  updatePageDeletion(args: {
    pages: Page[];
    deleted: boolean;
  }): Observable<any> {
    if (args.deleted) {
      this.logger.trace('Marking pages for deletion');
      return this.http.post(interpolate(MARK_PAGES_DELETED_URL), {
        ids: args.pages.map(page => page.id),
        deleted: true
      } as MarkPagesDeletedRequest);
    } else {
      this.logger.trace('Unmarking pages for deletion');
      return this.http.post(interpolate(MARK_PAGES_UNDELETED_URL), {
        ids: args.pages.map(page => page.id),
        deleted: false
      } as MarkPagesDeletedRequest);
    }
  }
}
