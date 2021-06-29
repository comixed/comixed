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

import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Comic } from '@app/comic-book/models/comic';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import {
  deselectComics,
  selectComics
} from '@app/library/actions/library.actions';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { Router } from '@angular/router';
import {
  PAGINATION_OPTIONS,
  PAGINATION_PREFERENCE
} from '@app/library/library.constants';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import { saveUserPreference } from '@app/user/actions/user.actions';

@Component({
  selector: 'cx-library-toolbar',
  templateUrl: './library-toolbar.component.html',
  styleUrls: ['./library-toolbar.component.scss']
})
export class LibraryToolbarComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() comics: Comic[] = [];
  @Input() selected: Comic[] = [];
  @Input() isAdmin = false;
  langChangSubscription: Subscription;

  paginationSubscription: Subscription;
  readonly paginationOptions = PAGINATION_OPTIONS;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.langChangSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.paginationSubscription = this.store
      .select(selectDisplayState)
      .subscribe(state => {
        this._pagination = state.pagination;
      });
  }

  _pagination = this.paginationOptions[0];

  get pagination(): number {
    return this._pagination;
  }

  @Input() set pagination(pagination: number) {
    this._pagination = pagination;
  }

  ngAfterViewInit(): void {
    this.loadTranslations();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.langChangSubscription.unsubscribe();
  }

  onSelectAll(): void {
    this.logger.debug('Selecting all comics');
    this.store.dispatch(selectComics({ comics: this.comics }));
  }

  onDeselectAll(): void {
    this.logger.debug('Deselecting all comics');
    this.store.dispatch(deselectComics({ comics: this.selected }));
  }

  onScrapeComics(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'scraping.start-scraping.confirmation-title',
        { count: this.selected.length }
      ),
      message: this.translateService.instant(
        'scraping.start-scraping.confirmation-message',
        { count: this.selected.length }
      ),
      confirm: () => {
        this.logger.debug('Start scraping comics');
        this.router.navigate(['/library', 'scrape']);
      }
    });
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

  private loadTranslations(): void {
    this.paginator._intl.itemsPerPageLabel = this.translateService.instant(
      'library.label.pagination-items-per-page'
    );
  }
}
