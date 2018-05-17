import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {ReadViewerComponent} from '../read-viewer/read-viewer.component';

@Component({
  selector: 'app-comic-details',
  templateUrl: './comic-details.component.html',
  styleUrls: ['./comic-details.component.css']
})
export class ComicDetailsComponent implements OnInit, OnDestroy {
  comic: Comic;
  sub: any;
  cover_url = '';
  show_characters = false;
  show_teams = false;
  show_story_arcs = false;
  show_locations = false;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private comicService: ComicService) {}

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.comicService.getComic(id).subscribe(
        (comic: Comic) => {
          this.comic = comic;
          this.cover_url = this.comicService.getImageUrl(this.comic.id, 0);
        },
        error => {
          console.log('error:', error.message);
        }
      );
    },
      error => {
        console.log('error:', error);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getImageURL(page_id: number): string {
    return this.comicService.getImageUrlForId(page_id);
  }

  getDownloadLink(): string {
    return this.comicService.getComicDownloadLink(this.comic.id);
  }
}
