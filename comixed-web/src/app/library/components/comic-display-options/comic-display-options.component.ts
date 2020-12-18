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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { selectDisplayState } from '@app/library/selectors/display.selectors';
import { filter } from 'rxjs/operators';
import {
  resetDisplayOptions,
  setPageSize
} from '@app/library/actions/display.actions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DisplayState } from '@app/library/reducers/display.reducer';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';
import { Subscription } from 'rxjs';
import { selectUser } from '@app/user/selectors/user.selectors';
import { User } from '@app/user';

@Component({
  selector: 'cx-comic-display-options',
  templateUrl: './comic-display-options.component.html',
  styleUrls: ['./comic-display-options.component.scss']
})
export class ComicDisplayOptionsComponent implements OnInit, OnDestroy {
  comicDisplayForm: FormGroup;

  displaySubscription: Subscription;
  userSubscription: Subscription;
  user: User;
  pageSize: number;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.comicDisplayForm = this.formBuilder.group({ pageSize: [''] });
    this.displaySubscription = this.store
      .select(selectDisplayState)
      .pipe(filter(state => !!state))
      .subscribe(state => this.loadForm(state));
    this.userSubscription = this.store
      .select(selectUser)
      .subscribe(user => (this.user = user));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.displaySubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  formatCoverSizeLabel(size: number): string {
    return `${size}px`;
  }

  private loadForm(state: DisplayState): void {
    this.logger.debug('Loading comic display options form');
    this.comicDisplayForm.controls.pageSize.setValue(state.pageSize);
  }

  onDisplaySizeChange(size: number): void {
    this.store.dispatch(setPageSize({ size, save: false }));
  }

  onSaveChanges(): void {
    this.logger.trace('Saving display options changes');
    this.store.dispatch(
      saveUserPreference({
        name: PAGE_SIZE_PREFERENCE,
        value: `${this.comicDisplayForm.controls.pageSize.value}`
      })
    );
    this.logger.trace('Closing display options dialog');
    this.dialogRef.close(false);
  }

  onCancelChanges(): void {
    this.logger.trace('User canceled display options changes');
    this.store.dispatch(resetDisplayOptions({ user: this.user }));
    this.dialogRef.close(false);
  }
}
