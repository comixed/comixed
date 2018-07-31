/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators, AbstractControl} from '@angular/forms';

import {FileDetails} from '../file-details.model';
import {ComicService} from '../comic.service';
import {ErrorsService} from '../../errors.service';

@Component({
  selector: 'app-import-comics',
  templateUrl: './import-comic-list.component.html',
  styleUrls: ['./import-comic-list.component.css']
})
export class ImportComicListComponent implements OnInit {
  directoryForm: FormGroup;
  directory: AbstractControl;
  files: FileDetails[];
  importing = false;
  plural = true;
  busy = false;
  busy_title: string;
  display = 'none';
  pending_imports = 0;
  waiting_on_imports = false;

  constructor(private comic_service: ComicService, private errorsService: ErrorsService,
    builder: FormBuilder) {
    this.directoryForm = builder.group({'directory': ['', Validators.required]});
    this.directory = this.directoryForm.controls['directory'];
  }

  ngOnInit() {
    const that = this;
    setInterval(() => {
      // don't try to get the pending imports if we're already doing it...
      if (that.waiting_on_imports === true) {
        return;
      }
      that.waiting_on_imports = true;
      that.comic_service.getPendingImports().subscribe(
        count => {
          that.pending_imports = count;
          if (count > 0) {
            that.busy_title = 'Importing ' + count + ' More Comic' + (that.plural ? 's' : '') + '...';
            that.importing = true;
          } else {
            that.importing = false;
          }
        },
        error => {
          console.log('ERROR', error.message);
          that.errorsService.fireErrorMessage('Error getting the number of pending imports...');
          that.importing = false;
        },
        () => {
          that.waiting_on_imports = false;
        });
    }, 250);
  }

  onLoad(): void {
    const that = this;
    this.busy_title = 'Fetching List Of Comic Files...';
    this.busy = true;
    const directory = this.directory.value;
    this.comic_service.getFilesUnder(directory).subscribe(
      files => {
        that.files = files;
        that.plural = this.files.length !== 1;
      },
      error => {
        console.log('ERROR:', error.message);
        that.errorsService.fireErrorMessage('Error while loading filenames...');
      },
      () => {
        that.busy = false;
      }
    );
  }

  toggleSelected(file: FileDetails): void {
    file.selected = !file.selected;
  }

  selectAllFiles(): void {
    this.files.forEach((file) => {
      file.selected = true;
    });
  }

  importFiles(): void {
    const that = this;
    this.importing = true;
    const selectedFiles = this.files.filter(file => file.selected).map(file => file.filename);
    this.comic_service.importFiles(selectedFiles).subscribe(
      () => {},
      error => {
        console.log('ERROR:', error.message);
        that.importing = false;
      }
    );
  }
}
