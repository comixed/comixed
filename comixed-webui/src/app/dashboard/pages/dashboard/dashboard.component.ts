/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { Component, inject, OnInit } from '@angular/core';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { Store } from '@ngrx/store';
import { selectLibraryState } from '@app/library/selectors/library.selectors';
import { CollectionListComponent } from '../../collection-list/collection-list.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/core/services/title.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { saveUserPreference } from '@app/user/actions/user.actions';
import {
  AVAILABLE_DASHBOARD_PANELS,
  DASHBOARD_PANELS_PREFERENCE
} from '@app/dashboard/dashboard.constants';
import { selectUser } from '@app/user/selectors/user.selectors';
import { getUserPreference } from '@app/user';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'cx-dashboard',
  imports: [TranslateModule, CollectionListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  libraryState: LibraryState | null;
  store = inject(Store);
  translateService = inject(TranslateService);
  titleService = inject(TitleService);
  logger = inject(LoggerService);
  panels = AVAILABLE_DASHBOARD_PANELS;

  constructor() {
    this.logger.debug('Subscribing to library state changes');
    this.store
      .select(selectLibraryState)
      .subscribe(state => (this.libraryState = state));
    this.logger.debug('Subscribing to user updates');
    this.store
      .select(selectUser)
      .pipe(filter(user => !!user))
      .subscribe(user => {
        this.panels = getUserPreference(
          user.preferences,
          DASHBOARD_PANELS_PREFERENCE,
          AVAILABLE_DASHBOARD_PANELS
        );
      });
    this.logger.debug('Subscribing to language changes');
    this.translateService.onLangChange.subscribe(lang =>
      this.loadTranslations()
    );
  }

  get displayPanels(): string[] {
    return this.panels.split('|');
  }

  closePanel(panelName: string): void {
    const value = this.displayPanels
      .filter(entry => entry !== panelName)
      .join('|');
    this.store.dispatch(
      saveUserPreference({ name: DASHBOARD_PANELS_PREFERENCE, value })
    );
  }

  ngOnInit(): void {
    this.logger.trace('Page initialized');
    this.loadTranslations();
  }

  private loadTranslations() {
    this.logger.debug('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('dashboard.tab-title')
    );
  }
}
