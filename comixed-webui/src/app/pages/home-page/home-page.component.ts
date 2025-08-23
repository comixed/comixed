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

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subscription } from 'rxjs';
import { TitleService } from '@app/core/services/title.service';
import { Store } from '@ngrx/store';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { filter } from 'rxjs/operators';
import { User } from '@app/user/models/user';
import { selectUser } from '@app/user/selectors/user.selectors';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CollectionsChartComponent } from '../../components/collections-chart/collections-chart.component';
import { ComicStateChartComponent } from '../../components/comic-state-chart/comic-state-chart.component';
import { ComicsByYearChartComponent } from '../../components/comics-by-year-chart/comics-by-year-chart.component';
import { ComicsReadChartComponent } from '../../components/comics-read-chart/comics-read-chart.component';

@Component({
  selector: 'cx-home',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  imports: [
    MatProgressBar,
    CollectionsChartComponent,
    ComicStateChartComponent,
    ComicsByYearChartComponent,
    ComicsReadChartComponent,
    TranslateModule
  ]
})
export class HomePageComponent implements OnInit, OnDestroy {
  langChangeSubscription: Subscription;
  loading = false;

  libraryStateSubscription: Subscription;
  libraryState: LibraryState = null;
  currentUserSubscription: Subscription;
  user: User;
  lastRead: number[] = [];

  logger = inject(LoggerService);
  titleService = inject(TitleService);
  translateService = inject(TranslateService);
  store = inject(Store);

  constructor() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.libraryStateSubscription = this.store
      .select(selectLibraryState)
      .pipe(filter(state => !!state))
      .subscribe(state => {
        this.logger.debug('Library state updated:', state);
        this.libraryState = state;
      });
    this.currentUserSubscription = this.store
      .select(selectUser)
      .subscribe(user => {
        this.lastRead = user?.readComicBooks || [];
      });
  }

  ngOnInit(): void {
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations(): void {
    this.logger.trace('Loading translations');
    this.titleService.setTitle(this.translateService.instant('home.tab-title'));
  }
}
