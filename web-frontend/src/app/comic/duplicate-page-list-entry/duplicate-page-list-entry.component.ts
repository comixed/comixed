import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router';

import {Observable} from 'rxjs/Observable';

import {ComicService} from '../comic.service';
import {Page} from '../page.model';
import {Comic} from '../comic.model';

@Component({
  selector: 'app-duplicate-list-entry',
  templateUrl: './duplicate-page-list-entry.component.html',
  styleUrls: ['./duplicate-page-list-entry.component.css']
})
export class DuplicatePageListEntryComponent implements OnInit {
  @Input() page: Page;
  image_url: string;
  comic: Comic;

  constructor(private router: Router, private comicService: ComicService) {}

  ngOnInit() {
    this.image_url = this.comicService.getImageUrlForId(this.page.id);
    this.comicService.getComic(this.page.comic_id).subscribe(
      comic => {
        this.comic = comic;
      },
      error => {
        console.log(error);
      }
    );
  }

  showComic(id: number) {
    this.router.navigate(['comics', id]);
  }
}
