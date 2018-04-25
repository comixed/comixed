import {Component, OnInit, Input} from '@angular/core';

import {Comic} from '../comic.model';

@Component({
  selector: 'app-comic-list-entry',
  templateUrl: './comic-list-entry.component.html',
  styleUrls: ['./comic-list-entry.component.css']
})

export class ComicListEntryComponent implements OnInit {
  @Input() comic: Comic;

  constructor() {}

  ngOnInit() {
  }

}
