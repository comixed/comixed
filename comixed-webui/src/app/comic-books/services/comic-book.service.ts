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
import { LoggerService } from '@angular-ru/cdk/logger';
import { HttpClient } from '@angular/common/http';
import {
  LOAD_COMIC_URL,
  OLD_LOAD_COMICS_URL,
  UPDATE_COMIC_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import { OldLoadComicsRequest } from '@app/comic-books/models/net/old-load-comics-request';
import {
  DELETE_SELECTED_COMIC_BOOKS_URL,
  DELETE_SINGLE_COMIC_BOOK_URL,
  MARK_PAGES_DELETED_URL,
  MARK_PAGES_UNDELETED_URL,
  SAVE_PAGE_ORDER_URL,
  UNDELETE_SELECTED_COMIC_BOOKS_URL,
  UNDELETE_SINGLE_COMIC_BOOK_URL
} from '@app/comic-books/comic-books.constants';
import { Page } from '@app/comic-books/models/page';
import { MarkPagesDeletedRequest } from '@app/comic-books/models/net/mark-pages-deleted-request';
import { PageOrderEntry } from '@app/comic-books/models/net/page-order-entry';
import { SavePageOrderRequest } from '@app/comic-books/models/net/save-page-order-request';
import { ComicBook } from '@app/comic-books/models/comic-book';

@Injectable({
  providedIn: 'root'
})
export class ComicBookService {
  constructor(private logger: LoggerService, private http: HttpClient) {}

  /**
   * Loads a batch of comics.
   *
   * @param args.maxRecords the max records to return
   * @param args.lastId the last id received
   */
  loadBatch(args: { maxRecords: number; lastId: number }): Observable<any> {
    this.logger.trace('Service: loading a batch of comics:', args);
    return this.http.post(interpolate(OLD_LOAD_COMICS_URL), {
      maxRecords: args.maxRecords,
      lastId: args.lastId
    } as OldLoadComicsRequest);
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
  updateOne(args: { comicBook: ComicBook }): Observable<any> {
    this.logger.trace('Service: updating one comic:', args);
    return this.http.put(
      interpolate(UPDATE_COMIC_URL, { id: args.comicBook.id }),
      args.comicBook
    );
  }

  /**
   * Marks a single comic book as deleted.
   *
   * @param args.comicBookId the comic book's id
   */
  deleteSingleComicBook(args: { comicBookId: number }): Observable<any> {
    this.logger.debug('Marking selected comic books as deleted');
    return this.http.delete(
      interpolate(DELETE_SINGLE_COMIC_BOOK_URL, {
        comicBookId: args.comicBookId
      })
    );
  }

  /**
   * Marks all selected comic books as undeleted.
   *
   * @param args.comicBookId the comic book's id
   */
  undeleteSingleComicBook(args: { comicBookId: number }): Observable<any> {
    this.logger.debug('Marking selected comic books as deleted');
    return this.http.put(
      interpolate(UNDELETE_SINGLE_COMIC_BOOK_URL, {
        comicBookId: args.comicBookId
      }),
      {}
    );
  }

  /**
   * Marks all selected comic books as deleted
   */
  deleteSelectedComicBooks(): Observable<any> {
    this.logger.debug('Marking selected comic books as deleted');
    return this.http.delete(interpolate(DELETE_SELECTED_COMIC_BOOKS_URL));
  }

  /**
   * Marks all selected comic books as undeleted.
   */
  undeleteSelectedComicBooks(): Observable<any> {
    this.logger.debug('Marking selected comic books as undeleted');
    return this.http.put(interpolate(UNDELETE_SELECTED_COMIC_BOOKS_URL), {});
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

  savePageOrder(args: {
    comicBook: ComicBook;
    entries: PageOrderEntry[];
  }): Observable<any> {
    this.logger.trace('Saving page order');
    return this.http.post(
      interpolate(SAVE_PAGE_ORDER_URL, { id: args.comicBook.id }),
      { entries: args.entries } as SavePageOrderRequest
    );
  }
}
