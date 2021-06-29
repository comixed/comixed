/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Comic } from '@app/comic-book/models/comic';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import {
  deselectComics,
  selectComics,
  setReadState
} from '@app/library/actions/library.actions';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ComicDetailsDialogComponent } from '@app/library/components/comic-details-dialog/comic-details-dialog.component';
import { PAGINATION_DEFAULT } from '@app/library/library.constants';
import { LibraryToolbarComponent } from '@app/library/components/library-toolbar/library-toolbar.component';
import { ComicBookState } from '@app/comic-book/models/comic-book-state';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { TranslateService } from '@ngx-translate/core';
import { updateComicInfo } from '@app/comic-book/actions/update-comic-info.actions';
import { selectDisplayState } from '@app/library/selectors/display.selectors';

@Component({
  selector: 'cx-comic-covers',
  templateUrl: './comic-covers.component.html',
  styleUrls: ['./comic-covers.component.scss']
})
export class ComicCoversComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(LibraryToolbarComponent) toolbar: LibraryToolbarComponent;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  @Input() selected: Comic[] = [];

  pagination = PAGINATION_DEFAULT;

  dataSource = new MatTableDataSource<Comic>();
  comic: Comic = null;
  contextMenuX = '';
  contextMenuY = '';
  displaySubscription: Subscription;
  private _comicObservable = new BehaviorSubject<Comic[]>([]);

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.displaySubscription = this.store
      .select(selectDisplayState)
      .subscribe(state => (this.pagination = state.pagination));
  }

  get comics(): Comic[] {
    return this._comicObservable.getValue();
  }

  @Input() set comics(comics: Comic[]) {
    this.logger.debug('Setting comics:', comics);
    this.dataSource.data = comics;
  }

  ngOnInit(): void {
    this._comicObservable = this.dataSource.connect();
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
    this.displaySubscription.unsubscribe();
  }

  isSelected(comic: Comic): boolean {
    return this.selected.includes(comic);
  }

  onSelectionChanged(comic: Comic, selected: boolean): void {
    if (selected) {
      this.logger.debug('Marking comic as selected:', comic);
      this.store.dispatch(selectComics({ comics: [comic] }));
    } else {
      this.logger.debug('Unmarking comic as selected:', comic);
      this.store.dispatch(deselectComics({ comics: [comic] }));
    }
  }

  onShowContextMenu(comic: Comic, x: string, y: string): void {
    this.logger.debug('Popping up context menu for:', comic);
    this.comic = comic;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onShowComicDetails(comic: Comic): void {
    this.logger.debug('Showing comic details:', comic);
    this.dialog.open(ComicDetailsDialogComponent, { data: comic });
  }

  onSetOneReadState(comic: Comic, read: boolean): void {
    this.logger.debug('Setting one comic read state:', comic, read);
    this.store.dispatch(setReadState({ comics: [comic], read }));
  }

  onSetSelectedReadState(read: boolean): void {
    this.logger.debug('Setting selected comics read state:', read);
    this.store.dispatch(setReadState({ comics: this.selected, read }));
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.toolbar.paginator;
  }

  isChanged(comic: Comic): boolean {
    return comic.comicState === ComicBookState.CHANGED;
  }

  onUpdateComicInfo(comic: Comic): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.update-comic-info.confirmation-title'
      ),
      message: this.translateService.instant(
        'comic-book.update-comic-info.confirmation-message'
      ),
      confirm: () => {
        this.logger.debug('Updating comic info:', comic);
        this.store.dispatch(updateComicInfo({ comic }));
      }
    });
  }
}
