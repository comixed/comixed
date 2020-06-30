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
import { LibraryAdaptor } from 'app/library';
import { Subscription } from 'rxjs';
import {
  MOVE_COMICS_DELETE_PHYSICAL_FILE,
  MOVE_COMICS_RENAMING_RULE,
  MOVE_COMICS_TARGET_DIRECTORY
} from 'app/user/models/preferences.constants';
import { AuthenticationAdaptor } from 'app/user';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-consolidate-library',
  templateUrl: './consolidate-library.component.html',
  styleUrls: ['./consolidate-library.component.scss']
})
export class ConsolidateLibraryComponent implements OnInit, OnDestroy {
  consolidationForm: FormGroup;
  consolidatingSubscription: Subscription;
  consolidating = false;
  userSubscription: Subscription;
  user = null;

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private libraryAdaptor: LibraryAdaptor,
    private authenticationAdaptor: AuthenticationAdaptor,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService
  ) {
    this.consolidationForm = this.formBuilder.group({
      deletePhysicalFiles: [''],
      targetDirectory: ['', Validators.required],
      renamingRule: ['']
    });
    this.consolidatingSubscription = this.libraryAdaptor.consolidating$.subscribe(
      consolidating => (this.consolidating = consolidating)
    );
    this.userSubscription = this.authenticationAdaptor.user$.subscribe(() => {
      this.consolidationForm.controls['deletePhysicalFiles'].setValue(
        this.authenticationAdaptor.getPreference(
          MOVE_COMICS_DELETE_PHYSICAL_FILE
        ) === '1'
      );
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.consolidatingSubscription.unsubscribe();
  }

  consolidateLibrary() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'consolidate-library.confirm.header'
      ),
      message: this.translateService.instant(
        'consolidate-library.confirm.message',
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
          deletePhysicalFiles ? '1' : '0'
        );
        this.authenticationAdaptor.setPreference(
          MOVE_COMICS_TARGET_DIRECTORY,
          targetDirectory
        );
        this.authenticationAdaptor.setPreference(
          MOVE_COMICS_RENAMING_RULE,
          renamingRule
        );
        this.libraryAdaptor.consolidate(
          deletePhysicalFiles,
          targetDirectory,
          renamingRule
        );
      }
    });
  }
}
