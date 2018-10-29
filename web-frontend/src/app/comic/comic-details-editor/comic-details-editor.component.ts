/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { AlertService } from '../../alert.service';
import { UserService } from '../../user.service';
import { ComicService } from '../comic.service';
import { Comic } from '../comic.model';
import { Volume } from '../volume.model';
import { ComicIssue } from '../comic-issue.model';

@Component({
  selector: 'app-comic-details-editor',
  templateUrl: './comic-details-editor.component.html',
  styleUrls: ['./comic-details-editor.component.css']
})
export class ComicDetailsEditorComponent implements OnInit {
  @Input() comic: Comic;
  @Output() stopEditing: EventEmitter<any> = new EventEmitter();
  protected api_key: string;
  protected series: string;
  protected volume: string;
  protected issue_number: string;
  protected volumes: Array<Volume> = [];
  protected issues: Map<string, ComicIssue> = new Map<string, ComicIssue>();
  protected current_volume_index: number;
  protected current_volume: Volume;
  protected current_issue: ComicIssue = null;
  protected volume_selection_banner: string;
  protected volume_selection_title = '';
  protected volume_selection_subtitle = '';
  private date_formatter = Intl.DateTimeFormat('en-us', { month: 'short', year: 'numeric' });

  constructor(
    private alert_service: AlertService,
    private user_service: UserService,
    private comic_service: ComicService,
  ) { }

  ngOnInit() {
    this.api_key = this.user_service.get_user_preference('comic_vine_api_key', '');
    this.series = this.comic.series;
    this.volume = this.comic.volume;
    this.issue_number = this.comic.issue_number;
  }

  stop_editing(): void {
    this.stopEditing.emit(true);
  }

  fetch_candidates(): void {
    // first cleanup any existing selection data
    this.volumes = [];
    this.current_issue = null;
    this.current_volume_index = -1;
    this.current_volume = null;
    this.issues.clear();

    const that = this;
    this.alert_service.show_busy_message('Fetching Matching Volumes...');
    this.comic_service.fetch_candidates_for(this.api_key.trim(), this.series, this.volume, this.issue_number).subscribe(
      (volumes: Array<Volume>) => {
        that.volumes = volumes || [];
        if (that.volumes.length > 0) {
          let initial_index = this.volumes.findIndex((volume: Volume) => {
            return (volume.start_year === that.volume) && (volume.name === that.series);
          });
          if (initial_index === -1) {
            initial_index = 0;
          }
          that.set_current_volume(initial_index);
        } else {
          that.alert_service.show_info_message('No Matching Comic Series Found...');
        }
        if (that.volumes.length === 0) {
          that.alert_service.show_busy_message('');
        }
      });
  }

  get_volume_option_label(volume: Volume): string {
    return `${volume.name} v${volume.start_year} (${volume.issue_count} Issue${volume.issue_count !== 1 ? 's' : ''})`;
  }

  get_index_for_volume(volume: Volume): number {
    return this.volumes.findIndex((entry: Volume) => {
      return entry.id === volume.id;
    });
  }

  set_current_volume_by_id(volume_id: string): void {
    const index = this.volumes.findIndex((volume: Volume) => {
      return volume.id === parseInt(volume_id, 10);
    });
    this.set_current_volume(index);
  }

  set_current_volume(index: number): void {
    index = parseInt(`${index}`, 10);
    if (index < this.volumes.length) {
      this.current_volume_index = index;
      this.current_volume = this.volumes[this.current_volume_index];
      if (this.issues.has(`${this.current_volume.id}`)) {
        this.load_current_issue_details();
      } else {
        this.load_current_issue();
      }
    } else {
      this.alert_service.show_error_message(`Index out of bounds: ${this.volumes.length} < ${index}`, null);
      this.current_volume_index = -1;
      this.current_issue = null;
      this.current_volume = null;
      this.alert_service.show_busy_message('');
    }
  }

  load_current_issue(): void {
    const that = this;
    this.alert_service.show_busy_message('Retrieving Details For Comic...');
    this.comic_service.scrape_comic_details_for(this.api_key.trim(), this.current_volume.id, this.issue_number).subscribe(
      (issue: ComicIssue) => {
        if (issue === null) {
          that.current_issue = null;
          that.alert_service.show_busy_message('');
          that.alert_service.show_info_message('No matching issue found. Please try another series...');
        } else {
          that.issues.set(`${that.current_volume.id}`, issue);
          that.load_current_issue_details();
          that.alert_service.show_busy_message('');
        }
      });
  }

  load_current_issue_details(): void {
    this.current_issue = this.issues.get(`${this.current_volume.id}`);
    this.volume_selection_banner = `Showing Volume #${this.current_volume_index + 1}`;
    this.volume_selection_title = `${this.current_issue.volume_name} #${this.current_issue.issue_number}`;
    this.volume_selection_subtitle = `Cover Date: ${this.date_formatter.format(new Date(this.current_issue.cover_date))}`;
  }

  show_candidates(): boolean {
    return (this.volumes.length > 0) && (this.current_volume_index >= 0);
  }

  get_current_issue_image_url(): string {
    if (this.current_issue === null) {
      return '';
    }
    return `${this.current_issue.cover_url}?api_key=${this.api_key.trim()}`;
  }

  select_current_issue(): void {
    this.alert_service.show_busy_message('Updating Comic Details. Please Wait...');
    const that = this;

    this.comic_service.scrape_and_save_comic_details(this.api_key.trim(), this.comic.id, this.current_issue.id).subscribe(
      (comic: Comic) => {
        const index = that.comic_service.all_comics.findIndex((thisComic: Comic) => {
          return thisComic.id === that.comic.id;
        });
        if (index !== -1) {
          that.comic_service.all_comics[index] = comic;
          that.alert_service.show_busy_message('');
          that.stopEditing.next(true);
        } else {
          that.alert_service.show_error_message(`Invalid comic index: ${index}`, null);
        }
      });
  }

  save_changes(): void {
    this.alert_service.show_busy_message('Saving Changes...');
    this.comic_service.save_changes_to_comic(this.comic.id, this.series, this.volume, this.issue_number).subscribe(
      () => {
        this.alert_service.show_busy_message('');
      }
    );
  }

  save_api_key(): void {
    this.api_key = this.api_key.trim();
    this.user_service.set_user_preference('comic_vine_api_key', this.api_key);
  }

  is_api_key_valid(): boolean {
    return (this.api_key || '').trim().length > 0;
  }
}
