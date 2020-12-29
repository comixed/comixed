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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Comic } from '@app/library';
import { Subscription } from 'rxjs';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { selectAllComics } from '@app/library/selectors/library.selectors';
import { TitleService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'cx-all-comics',
  templateUrl: './all-comics.component.html',
  styleUrls: ['./all-comics.component.scss']
})
export class AllComicsComponent implements OnInit, OnDestroy {
  comicSubscription: Subscription;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private titleService: TitleService,
    private translateService: TranslateService
  ) {
    this.comicSubscription = this.store
      .select(selectAllComics)
      .subscribe(comics => (this.comics = comics));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  private _comics: Comic[] = [];

  get comics(): Comic[] {
    return this._comics;
  }

  set comics(comics: Comic[]) {
    this.logger.trace('Showing all comics:', comics);
    this._comics = comics;
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.comicSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Setting page title');
    this.titleService.setTitle(
      this.translateService.instant('library.all-comics.title')
    );
  }
}
