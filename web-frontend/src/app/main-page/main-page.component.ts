import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {ComicService} from '../comic/comic.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  public comicCount: Observable<number>;
  public plural = false;

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    this.comicService.getComicCount().subscribe(
      res => {
        this.comicCount = res['count'];
        this.plural = res['count'] !== 1;
      },
      err => {
        console.log(err);
      }
    );
  }
}
