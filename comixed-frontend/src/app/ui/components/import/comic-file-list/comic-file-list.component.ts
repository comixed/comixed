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

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ComicFile } from 'app/models/import/comic-file';
import { Store } from '@ngrx/store';
import { AppState } from 'app/app.state';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import * as ImportActions from 'app/actions/importing.actions';
import * as SelectionActions from 'app/actions/selection.actions';
import { LibraryDisplayAdaptor } from 'app/adaptors/library-display.adaptor';

@Component({
  selector: 'app-comic-file-list',
  templateUrl: './comic-file-list.component.html',
  styleUrls: ['./comic-file-list.component.css']
})
export class ComicFileListComponent implements OnInit, OnDestroy {
  @Input() busy: boolean;
  @Input() directory: string;

  _comic_files: Array<ComicFile> = [];
  _selected_comic_files: Array<ComicFile> = [];

  layout: string;
  sort_field: string;
  rows: number;
  same_height: boolean;
  cover_size: number;

  translate_subscription: Subscription;
  context_menu: MenuItem[];

  show_selections = false;

  constructor(
    private library_display_adaptor: LibraryDisplayAdaptor,
    private store: Store<AppState>,
    private translate: TranslateService,
    private confirmation: ConfirmationService
  ) {
    this.library_display_adaptor.layout$.subscribe(
      layout => (this.layout = layout)
    );
    this.library_display_adaptor.sort_field$.subscribe(
      sort_field => (this.sort_field = sort_field)
    );
    this.library_display_adaptor.rows$.subscribe(rows => (this.rows = rows));
    this.library_display_adaptor.same_height$.subscribe(
      same_height => (this.same_height = same_height)
    );
    this.library_display_adaptor.cover_size$.subscribe(
      cover_size => (this.cover_size = cover_size)
    );
  }

  ngOnInit() {
    this.translate_subscription = this.translate.onLangChange.subscribe(() => {
      this.update_context_menu();
    });
  }

  ngOnDestroy() {
    this.translate_subscription.unsubscribe();
  }

  @Input() set comic_files(comic_files: ComicFile[]) {
    this._comic_files = comic_files;
    this.update_context_menu();
  }

  get comic_files(): ComicFile[] {
    return this._comic_files;
  }

  @Input() set selected_comic_files(selected_comic_files: ComicFile[]) {
    this._selected_comic_files = selected_comic_files;
    this.update_context_menu();
  }

  get selected_comic_files(): ComicFile[] {
    return this._selected_comic_files;
  }

  update_context_menu(): void {
    this.context_menu = [
      {
        label: this.translate.instant('comic-file-list.popup.select-all', {
          comic_count: this.comic_files.length
        }),
        command: () =>
          this.store.dispatch(
            new SelectionActions.SelectionAddComicFiles({
              comic_files: this.comic_files
            })
          ),
        disabled:
          !this.comic_files.length ||
          (this.selected_comic_files &&
            this.comic_files.length === this.selected_comic_files.length)
      },
      {
        label: this.translate.instant('comic-file-list.popup.deselect-all', {
          comic_count: this.selected_comic_files.length
        }),
        command: () =>
          this.store.dispatch(
            new SelectionActions.SelectionRemoveComicFiles({
              comic_files: this.selected_comic_files
            })
          ),
        visible:
          this.selected_comic_files && this.selected_comic_files.length > 0
      },
      {
        label: this.translate.instant('comic-file-list.popup.import.label', {
          comic_count: this.selected_comic_files.length
        }),
        items: [
          {
            label: this.translate.instant(
              'comic-file-list.popup.import.with-metadata'
            ),
            command: () =>
              this.start_import('comic-file-list.import.message', false),
            visible:
              this.selected_comic_files && this.selected_comic_files.length > 0
          },
          {
            label: this.translate.instant(
              'comic-file-list.popup.import.without-metadata'
            ),
            command: () =>
              this.start_import(
                'comic-file-list.import.message-ignore-metadata',
                true
              ),
            visible:
              this.selected_comic_files && this.selected_comic_files.length > 0
          }
        ]
      }
    ];
  }

  start_import(message_key: string, ignore_metadata: boolean): void {
    this.confirmation.confirm({
      header: this.translate.instant('comic-file-list.import.header'),
      message: this.translate.instant(message_key, {
        comic_count: this.selected_comic_files.length
      }),
      accept: () => {
        const filenames = [];
        this.selected_comic_files.forEach((comic_file: ComicFile) =>
          filenames.push(comic_file.filename)
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

  change_layout(layout: string): void {
    this.library_display_adaptor.set_layout(layout);
  }
}
