import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

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
  comic_count = 0;
  read_count = 0;

  constructor(private comicService: ComicService, private errorsService: ErrorsService, private router: Router) {
  }

  ngOnInit() {
    this.errorsService.error_messages.subscribe(
      (message: string) => {
        this.error_message = message;
      }
    );
    setInterval(() => {
      this.comicService.getComicCount().subscribe(
        count => this.comic_count = count,
        error => console.log('ERROR:', error.message));
    }, 250);
  }

  logout(): void {
    this.comicService.logout().subscribe(
      () => {
        this.router.navigateByUrl('/login');
      }
    );
  }

  clearErrorMessage(): void {
    this.error_message = '';
  }

  isAuthenticated(): boolean {
    return this.comicService.isAuthenticated();
  }
}
