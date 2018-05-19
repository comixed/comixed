import {Component, OnInit, Input} from '@angular/core';

import {Comic} from '../comic.model';
import {ComicService} from '../comic.service';

@Component({
  selector: 'app-read-viewer',
  templateUrl: './read-viewer.component.html',
  styleUrls: ['./read-viewer.component.css']
})
export class ReadViewerComponent implements OnInit {
  @Input() comic: Comic;
  @Input() current_page: number;

  constructor(private comicService: ComicService) {}

  ngOnInit() {
    if (!this.current_page) this.current_page = 0;
  }

  getImageURL(page_id: number): string {
    return this.comicService.getImageUrlForId(page_id);
  }

  getCurrentPageURL(): string {
    return this.comicService.getImageUrl(this.comic.id, this.current_page);
  }

  hasPreviousPage(): boolean {
    return (this.current_page > 0);
  }

  goToPreviousPage() {
    if (this.hasPreviousPage()) this.current_page = this.current_page - 1;
  }

  hasNextPage(): boolean {
    return (this.current_page < this.comic.page_count - 1);
  }

  goToNextPage() {
    if (this.hasNextPage()) this.current_page = this.current_page + 1;
  }
}
