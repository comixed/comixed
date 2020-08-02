/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { Store } from '@ngrx/store';
import {
  AppState,
  Comic,
  ComicFormat,
  Page,
  PageType,
  ScanType
} from 'app/comics';
import {
  ComicClearMetadata,
  ComicDelete,
  ComicGetFormats,
  ComicGetIssue,
  ComicGetPageTypes,
  ComicGetScanTypes,
  ComicMarkAsRead,
  ComicRestore,
  ComicSave,
  ComicSavePage,
  ComicSetPageDeleted,
  ComicSetPageHashBlocking,
  ComicSetPageType
} from 'app/comics/actions/comic.actions';
import {
  COMIC_FEATURE_KEY,
  ComicState
} from 'app/comics/reducers/comic.reducer';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/logger';

@Injectable()
export class ComicAdaptor {
  private _scanTypesLoaded$ = new BehaviorSubject<boolean>(false);
  private _scanTypes$ = new BehaviorSubject<ScanType[]>([]);
  private _formatsLoaded$ = new BehaviorSubject<boolean>(false);
  private _formats$ = new BehaviorSubject<ComicFormat[]>([]);
  private _fetchingIssue$ = new BehaviorSubject<boolean>(false);
  private _noComic$ = new BehaviorSubject<boolean>(false);
  private _fetchingPageTypes$ = new BehaviorSubject<boolean>(false);
  private _pageTypes$ = new BehaviorSubject<PageType[]>([]);
  private _pageTypesLoaded$ = new BehaviorSubject<boolean>(false);
  private _comic$ = new BehaviorSubject<Comic>(null);
  private _deletingComic$ = new BehaviorSubject<boolean>(false);
  private _restoringComic$ = new BehaviorSubject<boolean>(false);
  private _markingAsRead$ = new BehaviorSubject<boolean>(false);
  private _settingPageType$ = new BehaviorSubject<boolean>(false);
  private _deletingPage$ = new BehaviorSubject<boolean>(false);

  constructor(private logger: LoggerService, private store: Store<AppState>) {
    this.store
      .select(COMIC_FEATURE_KEY)
      .pipe(filter(state => !!state))
      .subscribe((state: ComicState) => {
        this.logger.debug('comic state updated:', state);
        if (state.scanTypesLoaded !== this._scanTypesLoaded$.getValue()) {
          this._scanTypesLoaded$.next(state.scanTypesLoaded);
        }
        if (!_.isEqual(this._scanTypes$.getValue(), state.scanTypes)) {
          this._scanTypes$.next(state.scanTypes);
        }
        if (state.formatsLoaded !== this._formatsLoaded$.getValue()) {
          this._formatsLoaded$.next(state.formatsLoaded);
        }
        if (!_.isEqual(this._formats$.getValue(), state.formats)) {
          this._formats$.next(state.formats);
        }
        if (this._fetchingPageTypes$.getValue() !== state.fetchingPageTypes) {
          this._fetchingPageTypes$.next(state.fetchingPageTypes);
        }
        if (this._pageTypesLoaded$.getValue() !== state.pageTypesLoaded) {
          this._pageTypesLoaded$.next(state.pageTypesLoaded);
        }
        if (!_.isEqual(this._pageTypes$.getValue(), state.pageTypes)) {
          this._pageTypes$.next(state.pageTypes);
        }
        if (state.fetchingComic !== this._fetchingIssue$.getValue()) {
          this._fetchingIssue$.next(state.fetchingComic);
        }
        if (state.noComic !== this._noComic$.getValue()) {
          this._noComic$.next(state.noComic);
        }
        if (state.deletingComic !== this._deletingComic$.getValue()) {
          this._deletingComic$.next(state.deletingComic);
        }
        if (state.restoringComic !== this._restoringComic$.getValue()) {
          this._restoringComic$.next(state.restoringComic);
        }
        if (!_.isEqual(state.comic, this._comic$.getValue())) {
          this._comic$.next(state.comic);
        }
        if (state.settingReadState !== this._markingAsRead$.getValue()) {
          this._markingAsRead$.next(state.settingReadState);
        }
        if (state.settingPageType !== this._settingPageType$.getValue()) {
          this._settingPageType$.next(state.settingPageType);
        }
        if (state.deletingPage !== this._deletingPage$.getValue()) {
          this._deletingPage$.next(state.deletingPage);
        }
      });
  }

  getScanTypes(): void {
    this.logger.debug('firing action to get scan types');
    if (this._scanTypesLoaded$.getValue() === false) {
      this.store.dispatch(new ComicGetScanTypes());
    }
  }

  get scanTypesLoaded$(): Observable<boolean> {
    return this._scanTypesLoaded$.asObservable();
  }

  get scanTypes$(): Observable<ScanType[]> {
    return this._scanTypes$.asObservable();
  }

  getFormats(): void {
    this.logger.debug('firing action to get formats');
    if (this._formatsLoaded$.getValue() === false) {
      this.store.dispatch(new ComicGetFormats());
    }
  }

  get formatsLoaded$(): Observable<boolean> {
    return this._formatsLoaded$.asObservable();
  }

  get formats$(): Observable<ComicFormat[]> {
    return this._formats$.asObservable();
  }

  getPageTypes(): void {
    this.logger.debug('Firing action to load page types');
    this.store.dispatch(new ComicGetPageTypes());
  }

  get fetchingPageTypes$(): Observable<boolean> {
    return this._fetchingPageTypes$.asObservable();
  }

  get pageTypesLoaded$(): Observable<boolean> {
    return this._pageTypesLoaded$.asObservable();
  }

  get pageTypes$(): Observable<PageType[]> {
    return this._pageTypes$.asObservable();
  }

  get fetchingIssue$(): Observable<boolean> {
    return this._fetchingIssue$.asObservable();
  }

  get noComic$(): Observable<boolean> {
    return this._noComic$.asObservable();
  }

  get comic$(): Observable<Comic> {
    return this._comic$.asObservable();
  }

  getComicById(id: number): void {
    this.logger.debug(`firing action to get comic: id=${id}`);
    this.store.dispatch(new ComicGetIssue({ id: id }));
  }

  savePage(page: Page): void {
    this.logger.debug('saving comic page:', page);
    this.store.dispatch(new ComicSavePage({ page: page }));
  }

  blockPageHash(page: Page): void {
    this.logger.debug(`firing action to block pages: hash=${page.hash}`);
    this.store.dispatch(
      new ComicSetPageHashBlocking({ page: page, state: true })
    );
  }

  unblockPageHash(page: Page): void {
    this.logger.debug(`firing action to unblock pages: hash=${page.hash}`);
    this.store.dispatch(
      new ComicSetPageHashBlocking({ page: page, state: false })
    );
  }

  saveComic(comic: Comic): void {
    this.logger.debug('firing action to save comic:', comic);
    this.store.dispatch(new ComicSave({ comic: comic }));
  }

  clearMetadata(comic: Comic): void {
    this.logger.debug('firing action to clear metadata for comic:', comic);
    this.store.dispatch(new ComicClearMetadata({ comic: comic }));
  }

  deleteComic(comic: Comic): void {
    this.logger.debug('firing action to delete comic:', comic);
    this.store.dispatch(new ComicDelete({ comic: comic }));
  }

  get deletingComic$(): Observable<boolean> {
    return this._deletingComic$.asObservable();
  }

  restoreComic(comic: Comic): void {
    this.logger.debug('firing action to restore comic:', comic);
    this.store.dispatch(new ComicRestore({ comic: comic }));
  }

  get restoringComic$(): Observable<boolean> {
    return this._restoringComic$.asObservable();
  }

  markAsRead(comic: Comic): void {
    this.logger.debug('marking comic as read:', comic);
    this.store.dispatch(new ComicMarkAsRead({ comic: comic, read: true }));
  }

  get markingAsRead$(): Observable<boolean> {
    return this._markingAsRead$.asObservable();
  }

  markAsUnread(comic: Comic): void {
    this.logger.debug('marking comic as unread:', comic);
    this.store.dispatch(new ComicMarkAsRead({ comic: comic, read: false }));
  }

  setPageType(page: Page, pageType: PageType): void {
    this.logger.debug('firing action to set page type:', page, pageType);
    this.store.dispatch(
      new ComicSetPageType({ page: page, pageType: pageType })
    );
  }

  get settingPageType$(): Observable<boolean> {
    return this._settingPageType$.asObservable();
  }

  deletePage(page: Page) {
    this.logger.debug('deleting a page:', page);
    this.store.dispatch(new ComicSetPageDeleted({ page: page, deleted: true }));
  }

  undeletePage(page: Page) {
    this.logger.debug('undeleting a page:', page);
    this.store.dispatch(
      new ComicSetPageDeleted({ page: page, deleted: false })
    );
  }

  get deletingPage$(): Observable<boolean> {
    return this._deletingPage$.asObservable();
  }
}
