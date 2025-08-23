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
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicPageComponent } from '../../../comic-books/components/comic-page/comic-page.component';
import { DatePipe } from '@angular/common';
import { ComicTitlePipe } from '@app/comic-books/pipes/comic-title.pipe';
import { ComicDetailCoverUrlPipe } from '@app/comic-books/pipes/comic-detail-cover-url.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cx-comic-details-dialog',
  templateUrl: './comic-details-dialog.component.html',
  styleUrls: ['./comic-details-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    ComicPageComponent,
    DatePipe,
    ComicTitlePipe,
    ComicDetailCoverUrlPipe,
    TranslateModule
  ]
})
export class ComicDetailsDialogComponent {
  comicBook = inject<ComicBook>(MAT_DIALOG_DATA);
}
