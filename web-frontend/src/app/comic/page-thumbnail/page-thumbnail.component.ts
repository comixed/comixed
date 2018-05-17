import {Component, OnInit, Input} from '@angular/core';

import {ComicService} from '../comic.service';
import {ErrorsService} from '../../errors.service';
import {Page} from '../page.model';

@Component({
  selector: 'app-page-thumbnail',
  templateUrl: './page-thumbnail.component.html',
  styleUrls: ['./page-thumbnail.component.css']
})
export class PageThumbnailComponent implements OnInit {
  @Input() missing: boolean;
  @Input() page: Page;
  page_url: string;
  show_details = false;
  width = 192;
  delete_page_title: string;
  undelete_page_title: string;
  delete_page_message: string;
  undelete_page_message: string;
  confirm_button = 'Yes';
  cancel_button = 'No';

  constructor(private comicService: ComicService,
    private errorsService: ErrorsService) {}

  ngOnInit() {
    this.page_url = this.missing ? '/assets/img/missing.png' : this.comicService.getImageUrlForId(this.page.id);
    this.delete_page_title = `Delete the page ${this.page.filename}`;
    this.undelete_page_title = `Undelete the page ${this.page.filename}`;
    this.delete_page_message = 'Are you sure you want to delete this page?';
    this.undelete_page_message = 'Are you sure you want to undelete this page?';
  }

  deletePage(): void {
    this.comicService.markPageAsDeleted(this.page)
      .subscribe(
      success => {
        this.page.deleted = true;
      },
      error => {
        this.errorsService.fireErrorMessage('Failed to delete page...');
      });
  }

  undeletePage(): void {
    this.comicService.markPageAsUndeleted(this.page)
      .subscribe(
      success => {
        this.page.deleted = false;
      },
      error => {
        this.errorsService.fireErrorMessage('Failed to undelete page...');
      });
  }
}
