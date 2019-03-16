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

import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { Comic } from '../../../../models/comics/comic';
import { Library } from '../../../../models/actions/library';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../app.state';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as LibraryActions from '../../../../actions/library.actions';
import * as ImportActions from '../../../../actions/importing.actions';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Importing } from '../../../../models/import/importing';
import { ComicFile } from '../../../../models/import/comic-file';
import { LibraryDisplay } from '../../../../models/actions/library-display';

@Component({
  selector: 'app-selected-comic-file-list',
  templateUrl: './selected-comic-file-list.component.html',
  styleUrls: ['./selected-comic-file-list.component.css']
})
export class SelectedComicFileListComponent implements OnInit {
  @Input() selected_comic_files: Array<ComicFile>;
  @Input() library_display: LibraryDisplay;
  @Input() display: boolean;

  @Output() hide = new EventEmitter<boolean>();

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
        label: this.translate.instant('selected-comic-files-list.button.import'),
        icon: 'fa fa-fw fa-upload',
        command: () => {
          this.confirmation_service.confirm({
            message: `Are you sure you want to import ${this.selected_comic_files.length} comics?`,
            accept: () => {
              const filenames = this.selected_comic_files.map((comic_file: ComicFile) => {
                return comic_file.filename;
              });
              this.store.dispatch(new ImportActions.ImportingImportFiles({ files: filenames }));
            }
          });
        }
      }
    ];
  }
}
