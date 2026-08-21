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

import { Component, inject } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { setBusyState } from '@app/core/actions/busy.actions';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { filter, tap } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from '@tragically-slick/confirmation';
import {
  loadBlockedHashDetail,
  saveBlockedHash
} from '@app/comic-pages/actions/blocked-hashes.actions';
import {
  selectBlockedHashDetail,
  selectBlockedHashesBusy,
  selectBlockedHashNotFound
} from '@app/comic-pages/selectors/blocked-hashes.selectors';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BlockedHashThumbnailUrlPipe } from '../../pipes/blocked-hash-thumbnail-url.pipe';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-blocked-hash-detail-page',
  templateUrl: './blocked-hash-detail-page.component.html',
  styleUrls: ['./blocked-hash-detail-page.component.scss'],
  imports: [
    MatFabButton,
    MatIcon,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    TranslateModule,
    BlockedHashThumbnailUrlPipe,
    AsyncPipe
  ]
})
export class BlockedHashDetailPageComponent {
  blockedPageForm: UntypedFormGroup;

  hash$ = new BehaviorSubject('');

  logger = inject(LoggerService);
  store = inject(Store);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  formBuilder = inject(UntypedFormBuilder);
  confirmationService = inject(ConfirmationService);
  translateService = inject(TranslateService);

  constructor() {
    this.activatedRoute.params
      .pipe(
        tap(params => {
          this.hash$.next(params.hash);
          this.logger.debug('Received blocked page hash:', this.hash$.value);
          this.store.dispatch(
            loadBlockedHashDetail({ hash: this.hash$.value })
          );
        })
      )
      .subscribe();
    this.blockedPageForm = this.formBuilder.group({
      label: ['', Validators.required],
      hash: ['']
    });
    this.store
      .select(selectBlockedHashesBusy)
      .pipe(tap(enabled => this.store.dispatch(setBusyState({ enabled }))))
      .subscribe();
    this.store
      .select(selectBlockedHashNotFound)
      .pipe(
        filter(notFound => notFound),
        tap(() => {
          this.logger.debug('Blocked page not found');
          this.router.navigateByUrl('/library/pages/blocked');
        })
      )
      .subscribe();
    this.store
      .select(selectBlockedHashDetail)
      .pipe(filter(entry => !!entry))
      .pipe(
        tap(entry => {
          this.blockedPage = entry;
        })
      )
      .subscribe();
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
