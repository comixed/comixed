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

import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import {AlertService} from '../../alert.service';
import {UserService} from '../../user.service';
import {ComicService} from '../comic.service';
import {Comic} from '../comic.model';
import {Volume} from '../volume.model';

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
  protected current_volume_index: number;
  protected current_volume: Volume = null;
  protected selected_volume: Volume = null;
  protected volume_selection_banner: string;
  protected volume_selection_title: string;
  protected volume_selection_subtitle: string;

  constructor(
    private alert_service: AlertService,
    private user_service: UserService,
    private comic_service: ComicService,
  ) {}

  ngOnInit() {
    this.user_service.get_user_preference('comic_vine_api_key', '');
    this.series = this.comic.series;
    this.volume = this.comic.volume;
    this.issue_number = this.comic.issue_number;
  }

  stop_editing(): void {
    this.stopEditing.emit(true);
  }

  fetch_candidates(): void {
    this.alert_service.show_busy_message('Fetching Matchingn Volumes...');
    this.comic_service.fetch_candidates_for(this.api_key, this.series).subscribe(
      (candidates: Array<Volume>) => {
        this.volumes = candidates || [];
        this.current_volume = null;
        if (this.volumes.length > 0) {
          this.current_volume = this.volumes[0];
          this.set_current_volume(0);
        }
        this.alert_service.show_busy_message('');
      });
  }

  set_current_volume(index: number): void {
    this.current_volume_index = index;
    this.current_volume = this.volumes[index];
    this.volume_selection_banner = `Showing ${index + 1} Of ${this.volumes.length}`;
    this.volume_selection_title = `${this.current_volume.name} (v${this.current_volume.start_year})`;
    this.volume_selection_subtitle =
      `${this.current_volume.publisher} : ${this.current_volume.issue_count} Issue${this.current_volume.issue_count > 0 ? 's' : ''}`;
  }

  show_candidates(): boolean {
    return (this.volumes.length > 0) && (this.current_volume !== null) && (this.selected_volume === null);
  }

  go_to_previous_volume(): void {
    let index = this.current_volume_index - 1;
    if (index < 0) {
      index = this.volumes.length - 1;
    }
    this.set_current_volume(index);
  }

  go_to_next_volume(): void {
    let index = this.current_volume_index + 1;
    if (index === this.volumes.length) {
      index = 0;
    }
    this.set_current_volume(index);
  }

  select_current_volume(): void {

  }
}
