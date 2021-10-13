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
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectUser } from '@app/user/selectors/user.selectors';
import { ConfirmationService } from '@app/core/services/confirmation.service';
import { TranslateService } from '@ngx-translate/core';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { Preference } from '@app/user/models/preference';
import { TitleService } from '@app/core/services/title.service';

@Component({
  selector: 'cx-user-preferences-page',
  templateUrl: './user-preferences-page.component.html',
  styleUrls: ['./user-preferences-page.component.scss']
})
export class UserPreferencesPageComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatSort) sort: MatSort;

  readonly displayedColumns = ['name', 'value', 'actions'];
  dataSource = new MatTableDataSource<Preference>([]);
  userSubscription: Subscription;
  langChangeSubscription: Subscription;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private titleService: TitleService
  ) {
    this.userSubscription = this.store.select(selectUser).subscribe(user => {
      this.logger.trace('Loading user preferences');
      this.dataSource.data = user.preferences;
    });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
  }

  ngAfterViewInit(): void {
    this.logger.trace('Assigning table sort');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
      console.log('*** sortHeaderId:', sortHeaderId);
      switch (sortHeaderId) {
        case 'name':
          return data.name;
        case 'value':
          return data.value;
      }
    };
    this.loadTranslations();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from user updates');
    this.userSubscription.unsubscribe();
    this.logger.trace('Unsubscribing from language change updates');
    this.langChangeSubscription.unsubscribe();
  }

  ngOnInit(): void {}

  onDeletePreference(name: string): void {
    this.confirmationService.confirm({
      title: this.translateService.instant(
        'user.user-preferences.delete-confirmation-title'
      ),
      message: this.translateService.instant(
        'user.user-preferences.delete-confirmation-message'
      ),
      confirm: () => {
        this.logger.trace('Deleting user preference:', name);
        this.store.dispatch(saveUserPreference({ name, value: null }));
      }
    });
  }

  private loadTranslations(): void {
    this.logger.trace('Loading tab title');
    this.titleService.setTitle(
      this.translateService.instant('user.user-preferences.tab-title')
    );
  }
}
