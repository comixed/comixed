import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {ComicService} from '../comic/comic.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  public comicCount: number;
  public plural = false;
  public duplicate_pages = 0;

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    this.comicService.getComicCount().subscribe(
      res => {
        this.comicCount = res;
        this.plural = res !== 1;
      },
      err => {
        console.log(err);
      }
    );
    this.comicService.getDuplicatePageCount().subscribe(
      res => {
        this.duplicate_pages = res;
      },
      err => {
        console.log(err);
      }
    );
  }
}
