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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import * as DisplayActions from 'app/actions/library-display.actions';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ComicFile } from 'app/models/import/comic-file';
import { LibraryDisplay } from 'app/models/state/library-display';
import * as ImportActions from 'app/actions/importing.actions';

@Component({
  selector: 'app-selected-comic-file-list',
  templateUrl: './selected-comic-file-list.component.html',
  styleUrls: ['./selected-comic-file-list.component.css']
})
export class SelectedComicFileListComponent implements OnInit {
  @Input() selected_comic_files: Array<ComicFile>;
  @Input() library_display: LibraryDisplay;

  protected actions: MenuItem[];

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private translate: TranslateService,
    private confirmation_service: ConfirmationService
  ) {
    this.load_actions();
  }

  ngOnInit() {
    this.load_actions();
  }

  private load_actions(): void {
    this.actions = [
      {
        label: this.translate.instant('selected-comic-file-list.button.import'),
        icon: 'fas fa-info-circle',
        command: () => {
          this.import_files(false);
        }
      },
      {
        label: this.translate.instant(
          'selected-comic-file-list.button.import-ignore-metadata'
        ),
        icon: 'fas fa-ban',
        command: () => {
          this.import_files(true);
        }
      }
    ];
  }

  import_files(ignore_metadata: boolean): void {
    this.confirmation_service.confirm({
      header: this.translate.instant(
        'selected-comic-file-list.header.confirm-import'
      ),
      message: this.translate.instant(
        'selected-comic-file-list.message.confirm-import',
        { comic_count: this.selected_comic_files.length }
      ),
      accept: () => {
        const filenames = this.selected_comic_files.map(
          (comic_file: ComicFile) => {
            return comic_file.filename;
          }
        );
        this.store.dispatch(
          new ImportActions.ImportingImportFiles({
            files: filenames,
            ignore_metadata: ignore_metadata
          })
        );
      }
    });
  }

  hide_selections(): void {
    this.store.dispatch(
      new DisplayActions.LibraryViewToggleSidebar({ show: false })
    );
  }
}
