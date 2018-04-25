import {Component, OnInit, Input} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';

@Component({
  selector: 'app-comic-list-entry',
  templateUrl: './comic-list-entry.component.html',
  styleUrls: ['./comic-list-entry.component.css']
})

export class ComicListEntryComponent implements OnInit {
  @Input() comic: Comic;
  coverUrl: string;

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    this.coverUrl = this.comicService.getImageUrl(this.comic.id, 0);
  }

}
