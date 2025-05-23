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
  UPDATE_COMIC_URL
} from '@app/library/library.constants';
import { interpolate } from '@app/core';
import {
  DELETE_SELECTED_COMIC_BOOKS_URL,
  DELETE_SINGLE_COMIC_BOOK_URL,
  DOWNLOAD_COMIC_BOOK_URL,
  MARK_PAGES_DELETED_URL,
  MARK_PAGES_UNDELETED_URL,
  SAVE_PAGE_ORDER_URL,
  UNDELETE_SELECTED_COMIC_BOOKS_URL,
  UNDELETE_SINGLE_COMIC_BOOK_URL
} from '@app/comic-books/comic-books.constants';
import { ComicPage } from '@app/comic-books/models/comic-page';
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
   * Loads a single comic.
   *
   * @param args.id the comic id
   */
  loadOne(args: { id: number }): Observable<any> {
    this.logger.debug('Service: loading one comic:', args);
    return this.http.get(interpolate(LOAD_COMIC_URL, { id: args.id }));
  }

  /**
   * Updates a single comic.
   *
   * @param args.comic the comic
   */
  updateOne(args: { comicBook: ComicBook }): Observable<any> {
    this.logger.debug('Service: updating one comic:', args);
    return this.http.put(
      interpolate(UPDATE_COMIC_URL, { id: args.comicBook.comicBookId }),
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
    pages: ComicPage[];
    deleted: boolean;
  }): Observable<any> {
    if (args.deleted) {
      this.logger.debug('Marking pages for deletion');
      return this.http.post(interpolate(MARK_PAGES_DELETED_URL), {
        ids: args.pages.map(page => page.comicPageId),
        deleted: true
      } as MarkPagesDeletedRequest);
    } else {
      this.logger.debug('Unmarking pages for deletion');
      return this.http.post(interpolate(MARK_PAGES_UNDELETED_URL), {
        ids: args.pages.map(page => page.comicPageId),
        deleted: false
      } as MarkPagesDeletedRequest);
    }
  }

  savePageOrder(args: {
    comicBook: ComicBook;
    entries: PageOrderEntry[];
  }): Observable<any> {
    this.logger.debug('Saving page order:', args);
    return this.http.post(
      interpolate(SAVE_PAGE_ORDER_URL, { id: args.comicBook.comicBookId }),
      { entries: args.entries } as SavePageOrderRequest
    );
  }

  downloadComicBook(args: { comicBook: ComicBook }): Observable<any> {
    this.logger.debug('Downloading comic book:', args);
    return this.http.get(
      interpolate(DOWNLOAD_COMIC_BOOK_URL, {
        comicBookId: args.comicBook.comicBookId
      })
    );
  }
}
