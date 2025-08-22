/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoggerService } from '@angular-ru/cdk/logger';
import { QUERY_PARAM_FILTER_TEXT } from '@app/core';
import { QueryParameterService } from '@app/core/services/query-parameter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cx-filter-text-form',
  templateUrl: './filter-text-form.component.html',
  styleUrl: './filter-text-form.component.scss',
  standalone: false
})
export class FilterTextFormComponent implements OnDestroy {
  @Output() filterTextChanged = new EventEmitter<string>();

  filterTextForm: FormGroup;
  queryParamSubscription: Subscription;
  queryParameterService = inject(QueryParameterService);
  logger = inject(LoggerService);
  formBuilder = inject(FormBuilder);

  constructor() {
    this.logger.trace('Creating filter text form');
    this.filterTextForm = this.formBuilder.group({
      filterTextInput: ['']
    });
    this.logger.trace('Subscribing to query parameters updates');
    this.queryParamSubscription =
      this.queryParameterService.filterText$.subscribe(text =>
        this.filterTextForm.controls.filterTextInput.setValue(text)
      );
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from query parameters updates');
    this.queryParamSubscription.unsubscribe();
  }

  onApplyFilter(searchText: string): void {
    this.logger.debug('Setting collection search text:', searchText);
    this.queryParameterService.updateQueryParam([
      {
        name: QUERY_PARAM_FILTER_TEXT,
        value: searchText?.length > 0 ? searchText : null
      }
    ]);
  }
}
