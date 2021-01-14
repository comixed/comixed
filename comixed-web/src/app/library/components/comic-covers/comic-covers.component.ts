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
import { Comic } from '@app/library';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  PAGINATION_OPTIONS,
  PAGINATION_PREFERENCE
} from '@app/library/library.constants';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';

@Component({
  selector: 'cx-comic-covers',
  templateUrl: './comic-covers.component.html',
  styleUrls: ['./comic-covers.component.scss']
})
export class ComicCoversComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() selected: Comic[] = [];

  readonly paginationOptions = PAGINATION_OPTIONS;

  langChangeSubscription: Subscription;
  displaySubscription: Subscription;
  pagination = this.paginationOptions[0];

  dataSource = new MatTableDataSource<Comic>();
  private _comicObservable = new BehaviorSubject<Comic[]>([]);

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.displaySubscription = this.store
      .select(selectDisplayState)
      .subscribe(state => {
        this.logger.debug('loading pagination from preferences');
        this.pagination = state.pagination;
      });
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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.loadTranslations();
  }

  onPaginationChange(pagination: number): void {
    this.logger.debug('Pagination changed:', pagination);
    this.store.dispatch(
      saveUserPreference({
        name: PAGINATION_PREFERENCE,
        value: `${pagination}`
      })
    );
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

  private loadTranslations(): void {
    this.logger.debug('Loading translations');
    this.paginator._intl.itemsPerPageLabel = this.translateService.instant(
      'library.label.pagination-items-per-page'
    );
  }
}
