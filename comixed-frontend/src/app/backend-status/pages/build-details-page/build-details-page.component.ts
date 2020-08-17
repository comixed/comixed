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

import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { BuildDetails } from 'app/backend-status/models/build-details';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'app/backend-status';
import { selectBuildDetails } from 'app/backend-status/selectors/build-detail.selectors';
import { fetchBuildDetails } from 'app/backend-status/actions/build-details.actions';

@Component({
  selector: 'app-build-details-page',
  templateUrl: './build-details-page.component.html',
  styleUrls: ['./build-details-page.component.scss']
})
export class BuildDetailsPageComponent implements OnDestroy {
  buildDetails: BuildDetails;
  langChangeSubscription: Subscription;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private breadcrumbAdaptor: BreadcrumbAdaptor,
    private store: Store<AppState>
  ) {
    this.store.dispatch(fetchBuildDetails());
    this.store
      .select(selectBuildDetails)
      .subscribe(buildDetails => (this.buildDetails = buildDetails));
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.help.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.help.build-details-page'
        )
      }
    ]);
    this.titleService.setTitle(
      this.translateService.instant('build-details.page-title')
    );
  }
}
