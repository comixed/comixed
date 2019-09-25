/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from 'app/app.state';
import * as DuplicatesActions from 'app/actions/duplicate-pages.actions';
import { MessageService } from 'primeng/api';
import { Duplicates } from 'app/models/state/duplicates';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbAdaptor } from 'app/adaptors/breadcrumb.adaptor';

export const DUPLICATES_HASH_PARAMETER = 'hash';

@Component({
  selector: 'app-duplicates-page',
  templateUrl: './duplicates-page.component.html',
  styleUrls: ['./duplicates-page.component.css']
})
export class DuplicatesPageComponent implements OnInit, OnDestroy {
  duplicates$: Observable<Duplicates>;
  duplicatesSubscription: Subscription;
  duplicates: Duplicates;
  langChangeSubscription: Subscription;

  constructor(
    private titleService: Title,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private messageService: MessageService,
    private breadcrumbAdaptor: BreadcrumbAdaptor
  ) {
    this.duplicates$ = store.select('duplicates');
  }

  ngOnInit() {
    this.duplicatesSubscription = this.duplicates$.subscribe(
      (duplicates: Duplicates) => {
        this.duplicates = duplicates;
        this.titleService.setTitle(
          this.translateService.instant('duplicates-page.title', {
            pages: this.duplicates.pages.length,
            hashes: this.duplicates.hashes.length
          })
        );

        if (this.duplicates.pages_deleted > 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Delete Comic',
            detail: `Marked ${this.duplicates.pages_deleted} page(s) for deletion...`
          });
        }
        if (this.duplicates.pages_undeleted) {
          this.messageService.add({
            severity: 'info',
            summary: 'Undelete Comic',
            detail: `Unmarked ${this.duplicates.pages_undeleted} page(s) for deletion...`
          });
        }
        if (
          this.duplicates.current_hash &&
          !this.duplicates.current_duplicates &&
          this.duplicates.pages.length > 0
        ) {
          this.store.dispatch(
            new DuplicatesActions.DuplicatePagesShowComicsWithHash({
              hash: this.duplicates.current_hash
            })
          );
        }
      }
    );
    this.activatedRoute.queryParams.subscribe(params => {
      if (params[DUPLICATES_HASH_PARAMETER]) {
        this.store.dispatch(
          new DuplicatesActions.DuplicatePagesShowComicsWithHash(
            params[DUPLICATES_HASH_PARAMETER]
          )
        );
      }
    });
    this.store.dispatch(new DuplicatesActions.DuplicatePagesFetchPages());
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
  }

  ngOnDestroy() {
    this.duplicatesSubscription.unsubscribe();
    this.langChangeSubscription.unsubscribe();
  }

  private loadTranslations() {
    this.breadcrumbAdaptor.loadEntries([
      { label: this.translateService.instant('breadcrumb.entry.admin.root') },
      {
        label: this.translateService.instant(
          'breadcrumb.entry.admin.duplicate-pages'
        )
      }
    ]);
  }
}
