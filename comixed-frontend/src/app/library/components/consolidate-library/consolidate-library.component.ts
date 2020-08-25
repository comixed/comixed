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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggerService } from '@angular-ru/logger';
import { AppState } from 'app/library';
import { Subscription } from 'rxjs';
import {
  MOVE_COMICS_DELETE_PHYSICAL_FILE,
  MOVE_COMICS_RENAMING_RULE,
  MOVE_COMICS_TARGET_DIRECTORY
} from 'app/user/models/preferences.constants';
import { AuthenticationAdaptor } from 'app/user';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import {
  selectMoveComicsStateStarting,
  selectMoveComicsStateSuccess
} from 'app/library/selectors/move-comics.selectors';
import { moveComics } from 'app/library/actions/move-comics.actions';

@Component({
  selector: 'app-consolidate-library',
  templateUrl: './consolidate-library.component.html',
  styleUrls: ['./consolidate-library.component.scss']
})
export class ConsolidateLibraryComponent implements OnInit, OnDestroy {
  const;
  VARIABLES = ['PUBLISHER', 'SERIES', 'VOLUME', 'YEAR', 'ISSUE', 'COVERDATE'];
  consolidationForm: FormGroup;
  successSubscription: Subscription;
  success = false;
  startingSubscription: Subscription;
  starting = false;
  userSubscription: Subscription;
  user = null;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private authenticationAdaptor: AuthenticationAdaptor,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private store: Store<AppState>
  ) {
    this.consolidationForm = this.formBuilder.group({
      deletePhysicalFiles: [''],
      targetDirectory: ['', Validators.required],
      renamingRule: ['']
    });
    this.startingSubscription = this.store
      .select(selectMoveComicsStateStarting)
      .subscribe(starting => (this.starting = starting));
    this.successSubscription = this.store
      .select(selectMoveComicsStateSuccess)
      .subscribe(success => (this.success = success));
    this.successSubscription = this.store
      .select(selectMoveComicsStateSuccess)
      .subscribe(success => (this.success = success));
    this.userSubscription = this.authenticationAdaptor.user$.subscribe(() => {
      this.consolidationForm.controls['deletePhysicalFiles'].setValue(
        this.authenticationAdaptor.getPreference(
            MOVE_COMICS_DELETE_PHYSICAL_FILE
        ) === 'true'
      );
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.startingSubscription.unsubscribe();
    this.successSubscription.unsubscribe();
  }

  set deletePhysicalFiles(deletePhysicalFiles: boolean) {
    this.consolidationForm.controls['deletePhysicalFiles'].setValue(
      deletePhysicalFiles
    );
  }

  consolidateLibrary() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'library.move-comics.confirmation-header'
      ),
      message: this.translateService.instant(
        'library.move-comics.confirmation-message',
        {
          deletePhysicalFiles: this.consolidationForm.controls[
            'deletePhysicalFiles'
          ].value
        }
      ),
      accept: () => {
        const deletePhysicalFiles = this.consolidationForm.controls[
          'deletePhysicalFiles'
        ].value;
        const targetDirectory = this.consolidationForm.controls[
          'targetDirectory'
        ].value;
        const renamingRule = this.consolidationForm.controls['renamingRule']
          .value;
        this.authenticationAdaptor.setPreference(
          MOVE_COMICS_DELETE_PHYSICAL_FILE,
            `${deletePhysicalFiles}`
        );
        this.authenticationAdaptor.setPreference(
          MOVE_COMICS_TARGET_DIRECTORY,
          targetDirectory
        );
        this.authenticationAdaptor.setPreference(
          MOVE_COMICS_RENAMING_RULE,
          renamingRule
        );
        this.store.dispatch(
          moveComics({
            directory: targetDirectory,
            renamingRule: renamingRule,
            deletePhysicalFiles: deletePhysicalFiles
          })
        );
      }
    });
  }

  showDeleteFilesWarning(checked: boolean) {
    if (checked) {
      this.confirmationService.confirm({
        icon: 'fa fa-fw fas fa-skull-crossbones',
        header: this.translateService.instant(
          'library.move-comics.delete-files-warning-header'
        ),
        message: this.translateService.instant(
          'library.move-comics.delete-files-warning-message'
        ),
        reject: () => (this.deletePhysicalFiles = false)
      });
    }
  }
}
