import {Component, OnInit, Input} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {ErrorsService} from '../../errors.service';
import {ComicListComponent} from '../comic-list/comic-list.component';

@Component({
  selector: 'app-comic-list-entry',
  templateUrl: './comic-list-entry.component.html',
  styleUrls: ['./comic-list-entry.component.css']
})

export class ComicListEntryComponent implements OnInit {
  @Input() comic: Comic;
  cover_url: string;
  title_text: string;
  delete_comic_title: string;
  delete_comic_message: string;
  @Input() selected: boolean;
  confirm_button = 'Yes';
  cancel_button = 'No!';

  constructor(private router: Router, private comicService: ComicService, private errorsService: ErrorsService,
    private comicListComponent: ComicListComponent) {
  }

  ngOnInit() {
    this.cover_url = this.comic.missing ? '/assets/img/missing.png' : this.comicService.getImageUrl(this.comic.id, 0);
    this.title_text = this.comic.series || 'Unknown Series';
    if (this.comic.issue_number) {
      this.title_text = this.title_text + ' #' + this.comic.issue_number;
    }
    if (this.comic.volume) {
      this.title_text = this.title_text + ' (v' + this.comic.volume + ')';
    }
    this.delete_comic_title = `Delete ${this.title_text}`;
    this.delete_comic_message = 'Are you sure you want to delete this comic?';
  }

  clicked(event: any): void {
    console.log('Selected comic: id=' + this.comic.id);
    this.comicService.setCurrentComic(this.comic);
    event.preventDefault();
  }

  openComic(): void {
    this.router.navigate(['/comics', this.comic.id]);
  }

  deleteComic(): void {
    this.comicService.deleteComic(this.comic).subscribe(
      success => {
        if (success) {
          this.comicService.removeComic(this.comic.id);
        }
      },
      (error: any) => {
        console.log('ERROR: ', error.message);
        this.errorsService.fireErrorMessage('Failed to delete comic from teh library');
      }
    );
  }
}
