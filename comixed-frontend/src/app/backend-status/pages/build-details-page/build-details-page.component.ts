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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BuildDetailsAdaptor } from 'app/backend-status/adaptors/build-details.adaptor';
import { Subscription } from 'rxjs';
import { BuildDetails } from 'app/backend-status/models/build-details';
import { formatDate } from '@angular/common';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-build-details-page',
  templateUrl: './build-details-page.component.html',
  styleUrls: ['./build-details-page.component.css']
})
export class BuildDetailsPageComponent implements OnInit, OnDestroy {
  buildDetailsSubscription: Subscription;
  buildDetails: BuildDetails;
  langChangeSubscription: Subscription;

  constructor(
    private buildDetailsAdaptor: BuildDetailsAdaptor,
    private translateService: TranslateService,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {}

  ngOnInit() {
    this.buildDetailsSubscription = this.buildDetailsAdaptor.build_detail$.subscribe(
      buildDetails => (this.buildDetails = buildDetails)
    );
    this.buildDetailsAdaptor.get_build_details();
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.buildDetailsSubscription.unsubscribe();
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
  }
}
