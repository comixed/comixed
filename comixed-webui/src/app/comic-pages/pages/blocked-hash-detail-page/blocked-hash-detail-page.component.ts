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

import { Component, OnDestroy } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { setBusyState } from '@app/core/actions/busy.actions';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { selectUser } from '@app/user/selectors/user.selectors';
import { isAdmin } from '@app/user/user.functions';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@tragically-slick/confirmation';
import {
  loadBlockedHashDetail,
  saveBlockedHash
} from '@app/comic-pages/actions/blocked-hashes.actions';
import {
  selectBlockedHashesState,
  selectBlockedHashDetail
} from '@app/comic-pages/selectors/blocked-hashes.selectors';

@Component({
  selector: 'cx-blocked-hash-detail-page',
  templateUrl: './blocked-hash-detail-page.component.html',
  styleUrls: ['./blocked-hash-detail-page.component.scss']
})
export class BlockedHashDetailPageComponent implements OnDestroy {
  paramsSubscription: Subscription;
  blockedPageDetailStateSubscription: Subscription;
  blockedPageSubscription: Subscription;
  userSubscription: Subscription;
  isAdmin = false;
  hash = '';

  blockedPageForm: UntypedFormGroup;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      this.hash = params.hash;
      this.logger.debug('Received blocked page hash:', this.hash);
      this.store.dispatch(loadBlockedHashDetail({ hash: this.hash }));
    });
    this.blockedPageForm = this.formBuilder.group({
      label: ['', Validators.required],
      hash: ['']
    });
    this.blockedPageDetailStateSubscription = this.store
      .select(selectBlockedHashesState)
      .subscribe(state => {
        this.store.dispatch(setBusyState({ enabled: state.busy }));
        if (!state.busy && state.notFound) {
          this.logger.debug('Blocked page not found');
          this.router.navigateByUrl('/library/pages/blocked');
        }
      });
    this.blockedPageSubscription = this.store
      .select(selectBlockedHashDetail)
      .pipe(filter(entry => !!entry))
      .subscribe(entry => {
        this.blockedPage = entry;
      });
    this.userSubscription = this.store
      .select(selectUser)
      .subscribe(user => (this.isAdmin = isAdmin(user)));
  }

  private _blockedPage: BlockedHash;

  get blockedPage(): BlockedHash {
    return this._blockedPage;
  }

  set blockedPage(blockedPage: BlockedHash) {
    this.logger.debug('Loading blocked page form:', blockedPage);
    this._blockedPage = blockedPage;
    this.blockedPageForm.controls.label.setValue(blockedPage.label || '');
    this.blockedPageForm.controls.hash.setValue(blockedPage.hash);
    this.blockedPageForm.updateValueAndValidity();
    this.blockedPageForm.markAsPristine();
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.blockedPageSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  onSave(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('blocked-hash.editing.save-title'),
      message: this.translateService.instant(
        'blocked-hash.editing.save-message'
      ),
      confirm: () => {
        this.logger.debug('Saving changes');
        this.store.dispatch(saveBlockedHash({ entry: this.encodeForm() }));
      }
    });
  }

  onReset(): void {
    this.confirmationService.confirm({
      title: this.translateService.instant('blocked-hash.editing.reset-title'),
      message: this.translateService.instant(
        'blocked-hash.editing.reset-message'
      ),
      confirm: () => {
        this.logger.debug('Resetting changes');
        this.blockedPage = this._blockedPage;
      }
    });
  }

  onGoBack(): void {
    this.router.navigateByUrl('/library/pages/blocked');
  }

  encodeForm(): BlockedHash {
    return {
      ...this.blockedPage,
      label: this.blockedPageForm.controls.label.value
    };
  }
}
