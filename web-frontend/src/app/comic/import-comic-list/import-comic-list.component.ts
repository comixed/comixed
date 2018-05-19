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
  display = 'none';
  pending_imports = 0;
  waiting_on_imports = false;

  constructor(private comicService: ComicService, private errorsService: ErrorsService,
    builder: FormBuilder) {
    this.directoryForm = builder.group({'directory': ['', Validators.required]});
    this.directory = this.directoryForm.controls['directory'];
  }

  ngOnInit() {
    setInterval(() => {
      this.waiting_on_imports = true;
      this.comicService.getPendingImports().subscribe(
        count => {
          this.pending_imports = count;
          this.waiting_on_imports = false;
        },
        error => {
          console.log('ERROR', error.message);
          this.errorsService.fireErrorMessage('Error getting the number of pending imports...');
          this.waiting_on_imports = false;
        });
    }, 500);
  }

  onLoad(): void {
    this.getFilesForImport();
  }

  getFilesForImport(): void {
    this.setBusyMode(true);
    const directory = this.directory.value;
    this.comicService.getFilesUnder(directory).subscribe(
      files => {
        this.files = files;
        this.plural = this.files.length !== 1;
        this.setBusyMode(false);
      },
      error => {
        console.log('ERROR:', error.message);
        this.errorsService.fireErrorMessage('Error while loading filenames...');
        this.setBusyMode(false);
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
    this.importing = true;
    const selectedFiles = this.files.filter(file => file.selected).map(file => file.filename);
    this.comicService.importFiles(selectedFiles).subscribe(
      value => {
        this.importing = false;
        this.getFilesForImport();
      },
      error => {
        console.log('ERROR:', error.message);
        this.importing = false;
      }
    );
  }

  setBusyMode(mode: boolean): void {
    this.busy = mode;
    this.display = this.busy ? 'block' : 'none';
  }
}
