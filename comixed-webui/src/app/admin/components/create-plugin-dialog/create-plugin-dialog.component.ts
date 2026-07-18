/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { loadPluginLanguages } from '@app/library-plugins/actions/plugin-language.actions';
import { PluginLanguage } from '@app/library-plugins/models/plugin-language';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  selectPluginLanguageBusy,
  selectPluginLanguageList
} from '@app/library-plugins/selectors/plugin-language.selectors';
import { TranslateModule } from '@ngx-translate/core';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardTitle
} from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CreatePluginDetails } from '@app/admin/models/ui/create-plugin-details';
import { MatDialogClose } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'cx-create-plugin-dialog',
  templateUrl: './create-plugin-dialog.component.html',
  styleUrls: ['./create-plugin-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatSelect,
    MatOption,
    MatCardActions,
    MatButton,
    MatIcon,
    TranslateModule,
    MatDialogClose,
    AsyncPipe
  ]
})
export class CreatePluginDialogComponent implements OnInit {
  pluginForm: FormGroup;

  busy$ = new BehaviorSubject(false);
  pluginLanguageList$ = new BehaviorSubject<PluginLanguage[]>([]);

  logger = inject(LoggerService);
  store = inject(Store);
  formBuilder = inject(FormBuilder);

  constructor() {
    this.store
      .select(selectPluginLanguageBusy)
      .pipe(
        tap(busy => {
          this.busy$.next(busy);
        })
      )
      .subscribe();
    this.store
      .select(selectPluginLanguageList)
      .pipe(tap(list => this.pluginLanguageList$.next(list)))
      .subscribe();
    this.pluginForm = this.formBuilder.group({
      filename: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(1024)
        ]
      ],
      language: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.logger.trace('Loading plugin languages');
    this.store.dispatch(loadPluginLanguages());
  }

  encodeDetails(): CreatePluginDetails {
    return {
      language: this.pluginForm.controls.language.value,
      filename: this.pluginForm.controls.filename.value
    };
  }
}
