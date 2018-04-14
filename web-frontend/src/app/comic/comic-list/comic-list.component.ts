import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {Comic} from '../comic';
import {ComicService} from '../comic.service';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css'],
  providers: [ComicService],
})
export class ComicListComponent implements OnInit {

  private comics: Comic[];

  constructor(private router: Router, private comicService: ComicService) {}

  ngOnInit() {
    this.getAllComics();
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
      this.router.navigate(['/comic/edit', comic.id]);
    }
  }

  deleteComic(comic: Comic) {
    console.log('Delete Comic!');
  }


}
