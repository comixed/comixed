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
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
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
import { updateMetadata } from '@app/library/actions/update-metadata.actions.ts';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import {
  ArchiveType,
  archiveTypeFromString
} from '@app/comic-book/models/archive-type.enum';
import { markComicsDeleted } from '@app/comic-book/actions/mark-comics-deleted.actions';
import { ReadingList } from '@app/lists/models/reading-list';
import { addComicsToReadingList } from '@app/lists/actions/reading-list-entries.actions';
import { convertComics } from '@app/library/actions/convert-comics.actions';

@Component({
  selector: 'cx-comic-covers',
  templateUrl: './comic-covers.component.html',
  styleUrls: ['./comic-covers.component.scss']
})
export class ComicCoversComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(LibraryToolbarComponent) toolbar: LibraryToolbarComponent;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  @Input() selected: Comic[] = [];
  @Input() readingLists: ReadingList[] = [];
  @Input() isAdmin = false;
  @Input() showConsolidate = false;
  @Input() archiveType: ArchiveType;
  @Input() showActions = true;

  @Output() archiveTypeChanged = new EventEmitter<ArchiveType>();

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
    this.logger.trace('Setting comics:', comics);
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
      this.logger.trace('Marking comic as selected:', comic);
      this.store.dispatch(selectComics({ comics: [comic] }));
    } else {
      this.logger.trace('Unmarking comic as selected:', comic);
      this.store.dispatch(deselectComics({ comics: [comic] }));
    }
  }

  onShowContextMenu(comic: Comic, x: string, y: string): void {
    this.logger.trace('Popping up context menu for:', comic);
    this.comic = comic;
    this.contextMenuX = x;
    this.contextMenuY = y;
    this.contextMenu.openMenu();
  }

  onShowComicDetails(comic: Comic): void {
    this.logger.trace('Showing comic details:', comic);
    this.dialog.open(ComicDetailsDialogComponent, { data: comic });
  }

  onSetOneReadState(comic: Comic, read: boolean): void {
    this.logger.trace('Setting one comic read state:', comic, read);
    this.store.dispatch(setReadState({ comics: [comic], read }));
  }

  onSetSelectedReadState(read: boolean): void {
    this.logger.trace('Setting selected comics read state:', read);
    this.store.dispatch(setReadState({ comics: this.selected, read }));
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.toolbar.paginator;
  }

  isChanged(comic: Comic): boolean {
    return comic.comicState === ComicBookState.CHANGED;
  }

  onUpdateMetadata(comic: Comic): void {
    this.logger.trace('Confirming updating ComicInfo.xml');
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.update-metadata.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.update-metadata.confirmation-message',
        { count: 1 }
      ),
      confirm: () => {
        this.logger.trace('Updating comic info:', comic);
        this.store.dispatch(updateMetadata({ comics: [comic] }));
      }
    });
  }

  onArchiveTypeChanged(archiveType: ArchiveType): void {
    this.logger.trace('Firing archive type changed event:', archiveType);
    this.archiveTypeChanged.emit(archiveType);
  }

  onMarkAsDeleted(comic: Comic, deleted: boolean): void {
    this.logger.trace('Confirming deleted state with user:', comic, deleted);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'comic-book.mark-as-deleted.confirmation-title',
        {
          deleted
        }
      ),
      message: this.translateService.instant(
        'comic-book.mark-as-deleted.confirmation-message',
        { deleted }
      ),
      confirm: () => {
        this.logger.trace('Firing deleted state change:', comic, deleted);
        this.store.dispatch(markComicsDeleted({ comics: [comic], deleted }));
      }
    });
  }

  onMarkSelectedDeleted(deleted: boolean): void {
    this.logger.trace(
      'Confirming selected comics deleted state with user:',
      deleted
    );
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.mark-selected-as-deleted.confirmation-title',
        {
          deleted
        }
      ),
      message: this.translateService.instant(
        'library.mark-selected-as-deleted.confirmation-message',
        { deleted }
      ),
      confirm: () => {
        this.logger.trace('Firing selected comics  state change:', deleted);
        this.store.dispatch(
          markComicsDeleted({ comics: this.selected, deleted })
        );
      }
    });
  }

  addSelectedToReadingList(list: ReadingList): void {
    this.logger.trace('Confirming adding comics to reading list:', list);
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'library.add-to-reading-list.confirmation-title'
      ),
      message: this.translateService.instant(
        'library.add-to-reading-list.confirmation-message',
        { count: this.selected.length, name: list.name }
      ),
      confirm: () => {
        this.logger.trace('Firing action: add comics to reading list');
        this.store.dispatch(
          addComicsToReadingList({ list, comics: this.selected })
        );
      }
    });
  }

  onConvertOne(comic: Comic, format: string): void {
    this.doConversion(
      this.translateService.instant(
        'library.convert-comics.convert-one.confirmation-title'
      ),
      this.translateService.instant(
        'library.convert-comics.convert-one.confirmation-message',
        { format }
      ),
      format,
      [comic]
    );
  }

  onConvertSelected(format: string): void {
    this.doConversion(
      this.translateService.instant(
        'library.convert-comics.convert-selected.confirmation-title'
      ),
      this.translateService.instant(
        'library.convert-comics.convert-selected.confirmation-message',
        { format, count: this.selected.length }
      ),
      format,
      this.selected
    );
  }

  private doConversion(
    title: string,
    message: string,
    format: string,
    comics: Comic[]
  ): void {
    const archiveType = archiveTypeFromString(format);
    this.logger.trace('Confirming conversion with user');
    this.confirmationService.confirm({
      title,
      message,
      confirm: () => {
        this.logger.trace('Firing action to convert comics');
        this.store.dispatch(
          convertComics({
            comics,
            archiveType,
            deletePages: true,
            renamePages: true
          })
        );
      }
    });
  }
}
