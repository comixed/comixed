import { Component } from '@angular/core';

import {ComicService} from './comic/comic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ComicService],
})
export class AppComponent {
  title = 'app';
}
