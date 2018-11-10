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

import {Pipe, PipeTransform} from '@angular/core';

import {FileDetails} from '../../models/file-details.model';

@Pipe({
  name: 'selected_for_import'
})
export class SelectedForImportPipe implements PipeTransform {

  transform(file_details: FileDetails[], selected_only: boolean): any {
    if (!file_details) {
      return [];
    }

    if (selected_only === false) {
      return file_details;
    }

    const result = file_details.filter((file_detail: FileDetails) => {
      return file_detail.selected;
    });

    console.log('result=', result);

    return result;
  }
}
