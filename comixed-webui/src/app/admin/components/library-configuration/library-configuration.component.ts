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

import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ListItem } from '@app/core/models/ui/list-item';

@Component({
  selector: 'cx-library-configuration',
  templateUrl: './library-configuration.component.html',
  styleUrls: ['./library-configuration.component.scss']
})
export class LibraryConfigurationComponent implements OnInit {
  @Input() form: FormGroup;

  readonly variableOptions: ListItem<string>[] = [
    {
      label: '$PUBLISHER',
      value: 'configuration.text.renaming-rule-publisher'
    },
    { label: '$SERIES', value: 'configuration.text.renaming-rule-series' },
    { label: '$VOLUME', value: 'configuration.text.renaming-rule-volume' },
    {
      label: '$ISSUE',
      value: 'configuration.text.renaming-rule-issue-number'
    },
    {
      label: '$COVERDATE',
      value: 'configuration.text.renaming-rule-cover-date'
    },
    { label: '$FORMAT', value: 'configuration.text.renaming-rule-format' },
    {
      label: '$PUBMONTH',
      value: 'configuration.text.renaming-rule-published-month'
    },
    {
      label: '$PUBYEAR',
      value: 'configuration.text.renaming-rule-published-year'
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}
