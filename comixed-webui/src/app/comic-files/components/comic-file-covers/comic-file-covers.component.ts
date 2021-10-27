/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ComicFile } from '@app/comic-files/models/comic-file';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { User } from '@app/user/models/user';
import { ComicFileToolbarComponent } from '@app/comic-files/components/comic-file-toolbar/comic-file-toolbar.component';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { setComicFilesSelectedState } from '@app/comic-files/actions/comic-file-list.actions';
import { getUserPreference } from '@app/user';
import {
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_PREFERENCE
} from '@app/library/library.constants';

@Component({
  selector: 'cx-comic-file-covers',
  templateUrl: './comic-file-covers.component.html',
  styleUrls: ['./comic-file-covers.component.scss']
})
export class ComicFileCoversComponent implements OnInit, AfterViewInit {
  @ViewChild(ComicFileToolbarComponent) toolbar: ComicFileToolbarComponent;
  @Input() selectedFiles: ComicFile[] = [];
  dataSource = new MatTableDataSource<ComicFile>([]);
  pageSize = PAGE_SIZE_DEFAULT;
  private _fileObservable = new BehaviorSubject<ComicFile[]>([]);

  constructor(private logger: LoggerService, private store: Store<any>) {}

  private _user: User;

  get user(): User {
    return this._user;
  }

  @Input() set user(user: User) {
    this._user = user;
    this.pageSize = parseInt(
      getUserPreference(
        user.preferences,
        PAGE_SIZE_PREFERENCE,
        `${PAGE_SIZE_DEFAULT}`
      ),
      10
    );
  }

  get files(): ComicFile[] {
    return this._fileObservable.getValue();
  }

  @Input() set files(files: ComicFile[]) {
    this.dataSource.data = files;
  }

  ngOnInit(): void {
    this.logger.trace('Connecting to file observable');
    this._fileObservable = this.dataSource.connect();
  }

  isFileSelected(file: ComicFile): boolean {
    return this.selectedFiles.includes(file);
  }

  ngAfterViewInit(): void {
    this.logger.trace('Setting comic file pagination');
    this.dataSource.paginator = this.toolbar.paginator;
  }

  onSelectAll(): void {
    this.logger.trace('Firing action: select all comic files');
    this.store.dispatch(
      setComicFilesSelectedState({
        files: this.dataSource.data,
        selected: true
      })
    );
  }
}
