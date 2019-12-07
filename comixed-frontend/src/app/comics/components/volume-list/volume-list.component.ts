/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Comic } from 'app/comics';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';

interface ScrapingVolumeOptions {
  volume: ScrapingVolume;
  matchability: string;
}

@Component({
  selector: 'app-volume-list',
  templateUrl: './volume-list.component.html',
  styleUrls: ['./volume-list.component.scss']
})
export class VolumeListComponent implements OnInit {
  private _volumeOptions: ScrapingVolumeOptions[];

  @Input() multiComicMode = false;
  @Input() apiKey: string;
  @Input() comic: Comic;
  @Input() currentVolume: ScrapingVolume;
  @Input() currentIssue: ScrapingIssue;

  @Output() volumeSelected = new EventEmitter<ScrapingVolume>();
  @Output() issueSelected = new EventEmitter<ScrapingIssue>();
  @Output() cancelSelection = new EventEmitter<Comic>();

  constructor() {}

  ngOnInit() {}

  @Input()
  set volumes(volumes: ScrapingVolume[]) {
    const exactMatches: ScrapingVolumeOptions[] = [];

    this._volumeOptions = [];
    volumes.forEach((volume: ScrapingVolume) => {
      const entry = {
        volume: volume,
        matchability: this.isGoodMatch(volume)
          ? '1'
          : this.isPerfectMatch(volume)
          ? '0'
          : '2'
      };
      this._volumeOptions.push(entry);
      if (entry.matchability === '0') {
        exactMatches.push(entry);
      }
    });

    let matchingVolume = null;

    if (exactMatches.length === 1) {
      matchingVolume = exactMatches[0].volume;
    }

    this.selectVolume(matchingVolume);
  }

  get volumeOptions(): ScrapingVolumeOptions[] {
    return this._volumeOptions;
  }

  get volumes(): ScrapingVolume[] {
    return this._volumeOptions.map(entry => entry.volume);
  }

  selectVolume(volume: ScrapingVolume): void {
    this.volumeSelected.next(volume);
  }

  private isGoodMatch(volume: ScrapingVolume): boolean {
    if (!this.isPerfectMatch(volume)) {
      return this.comic.volume === volume.startYear;
    }

    return false;
  }

  private isPerfectMatch(volume: ScrapingVolume): boolean {
    return (
      this.comic.volume === volume.startYear &&
      this.comic.series === volume.name
    );
  }

  cancelVolumeSelection(): void {
    this.cancelSelection.next(this.comic);
  }

  selectCurrentIssue() {
    this.issueSelected.next(this.currentIssue);
  }
}
