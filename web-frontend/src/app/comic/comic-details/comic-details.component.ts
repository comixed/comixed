import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute, Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';

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
      console.log('Using the id', id, 'to load a comic');
      this.comicService.getComic(id).subscribe(
        comic => {
          this.comic = comic;
          this.cover_url = this.comicService.getImageUrl(this.comic.id, 0);
        },
        error => {
          console.log('error:', error);
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
}
