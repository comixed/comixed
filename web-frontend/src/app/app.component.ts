import {Component, OnInit} from '@angular/core';

import {ComicService} from './comic/comic.service';
import {ErrorsService} from './errors.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ComicService, ErrorsService],
})
export class AppComponent implements OnInit {
  title = 'ComixEd';
  error_message: string;

  constructor(private errorsService: ErrorsService) {}

  ngOnInit() {
    this.errorsService.error_messages.subscribe(
      (message: string) => {
        this.error_message = message;
      }
    );
  }

  clearErrorMessage(): void {
    this.error_message = '';
  }
}
