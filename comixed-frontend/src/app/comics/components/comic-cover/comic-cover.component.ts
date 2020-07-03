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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ComicFile } from 'app/comic-import/models/comic-file';
import { Comic } from 'app/comics';
import { ComicCoverClickEvent } from 'app/comics/models/event/comic-cover-click-event';
import { ComicTitlePipe } from 'app/comics/pipes/comic-title.pipe';
import { LibraryAdaptor } from 'app/library';
import { DuplicatePage } from 'app/library/models/duplicate-page';
import { ContextMenuAdaptor } from 'app/user-experience/adaptors/context-menu.adaptor';
import { LoggerService } from '@angular-ru/logger';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comic-cover',
  templateUrl: './comic-cover.component.html',
  styleUrls: ['./comic-cover.component.scss']
})
export class ComicCoverComponent implements OnInit, OnDestroy {
  private _comic: Comic;
  private _comicFile: ComicFile;

  @Input() caption = null;
  @Input() coverUrl: string;
  @Input() duplicatePage: DuplicatePage;
  @Input() coverSize: number;
  @Input() useSameHeight: boolean;
  @Input() selected = false;
  @Input() selectSelectedClass = true;
  @Input() unprocessed = false;

  @Output() click = new EventEmitter<ComicCoverClickEvent>();

  contextMenuVisibleSubscription: Subscription;

  baseMenuId = '';

  constructor(
    private logger: LoggerService,
    private router: Router,
    private contextMenuAdaptor: ContextMenuAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.contextMenuVisibleSubscription = this.contextMenuAdaptor.visible$.subscribe(
      visible => {
        if (!visible) {
          this.hideMenuItems();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.contextMenuVisibleSubscription.unsubscribe();
  }

  @Input()
  set comic(comic: Comic) {
    this._comic = comic;
    this.baseMenuId = `comic-${comic.id}`;
    this.contextMenuAdaptor.addItem(
      `${this.baseMenuId}-open`,
      'fa fa-fw fa-book-open',
      this.translateService.instant('comic-cover.context-menu.open-comic'),
      true,
      false,
      () => this.openComic()
    );
    this.contextMenuAdaptor.addItem(
      `${this.baseMenuId}-delete`,
      'fa fa-fw fa-trash',
      this.translateService.instant('comic-cover.context-menu.delete-comic'),
      true,
      false,
      () => this.deleteComic()
    );
    this.contextMenuAdaptor.addItem(
      `${this.baseMenuId}-restore`,
      'fa fa-fw fa-trash',
      this.translateService.instant('comic-cover.context-menu.restore-comic'),
      true,
      false,
      () => this.undeleteComic()
    );
  }

  get comic(): Comic {
    return this._comic;
  }

  @Input()
  set comicFile(comicFile: ComicFile) {
    this._comicFile = comicFile;
    this.baseMenuId = `comic-file-${comicFile.id}`;
  }

  get comicFile(): ComicFile {
    return this._comicFile;
  }

  clicked(): void {
    this.click.emit({
      selected: !this.selected,
      comic: this.comic,
      comicFile: this.comicFile,
      duplicatePage: this.duplicatePage
    });
  }

  showOverlay(): boolean {
    return this.unprocessed || (!!this.comic && !!this.comic.deletedDate);
  }

  hideMenuItems(): void {
    this.logger.debug('hiding comic items');
    if (!!this._comic) {
      this.contextMenuAdaptor.hideItem(`${this.baseMenuId}-open`);
      this.contextMenuAdaptor.hideItem(`${this.baseMenuId}-delete`);
      this.contextMenuAdaptor.hideItem(`${this.baseMenuId}-restore`);
    }
  }

  showContextMenu($event: MouseEvent) {
    this.contextMenuAdaptor.hideMenu(); // to disable other menu items
    if (!!this._comic) {
      this.contextMenuAdaptor.showItem(`${this.baseMenuId}-open`);
      if (!!this._comic.deletedDate) {
        this.contextMenuAdaptor.showItem(`${this.baseMenuId}-restore`);
      }
    } else {
      this.contextMenuAdaptor.showItem(`${this.baseMenuId}-delete`);
    }
    this.contextMenuAdaptor.showMenu($event);
  }

  private openComic() {
    this.router.navigate(['comics', this.comic.id]);
  }

  private deleteComic() {
    this.confirmationService.confirm({
      header: this.translateService.instant('comic-cover.delete-comic.header'),
      message: this.translateService.instant(
        'comic-cover.delete-comic.message',
        { title: new ComicTitlePipe().transform(this.comic) }
      ),
      accept: () => this.libraryAdaptor.deleteComics([this.comic.id])
    });
  }

  private undeleteComic() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'comic-cover.restore-comic.header'
      ),
      message: this.translateService.instant(
        'comic-cover.restore-comic.message',
        { title: new ComicTitlePipe().transform(this.comic) }
      ),
      accept: () => this.libraryAdaptor.undeleteComics([this.comic.id])
    });
  }
}
