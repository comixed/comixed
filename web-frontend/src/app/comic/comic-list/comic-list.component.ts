import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';
import {ComicListEntryComponent} from '../comic-list-entry/comic-list-entry.component';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css'],
  providers: [ComicService],
})
export class ComicListComponent implements OnInit {
  private comics: Comic[];
  private current_comic: Comic;

  constructor(private router: Router, private comicService: ComicService) {}

  ngOnInit() {
    this.getAllComics();
    this.comicService.current_comic.subscribe(
      (comic: Comic) => {
        this.current_comic = comic;
      });
  }

  getImageURL(comic: Comic): string {
    if (comic.missing == true) {
      return this.comicService.getMissingImageUrl();
    } else {
      return this.comicService.getImageUrl(comic.id, 0);
    }
  }

  getTitleTextFor(comic: Comic): string {
    let result = comic.series || comic.filename;

    if (comic.issue_number != null) {
      result = result + ' #' + comic.issue_number;
    }
    if (comic.volume != null) {
      result = result + ' (v' + comic.volume + ')';
    }

    return result;
  }

  getAllComics() {
    this.comicService.findAll().subscribe(
      comics => {
        this.comics = comics;
      },
      err => {
        console.log(err);
      }
    )
  }

  redirectAddComicPage() {
    this.router.navigate(['/comic/add']);
  }

  editComicPage(comic: Comic) {
    if (comic) {
      console.log('Edit comic: id=' + comic.id + " filename=" + comic.filename);
    }
  }

  deleteComic(comic: Comic) {
    if (comic) {
      console.log('Delete comic: id=' + comic.id + " filename=" + comic.filename);
    }
  }


}
