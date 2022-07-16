/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { ComicStateData } from '@app/models/ui/comic-state-data';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LibraryState } from '@app/library/reducers/library.reducer';
import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';

@Component({
  selector: 'cx-comic-state-chart',
  templateUrl: './comic-state-chart.component.html',
  styleUrls: ['./comic-state-chart.component.scss']
})
export class ComicStateChartComponent implements OnDestroy, AfterViewInit {
  @ViewChild('container') container: ElementRef;
  langChangeSubscription: Subscription;

  comicStateData: ComicStateData[] = [];
  chartHeight$ = new BehaviorSubject<number>(0);
  chartWidth$ = new BehaviorSubject<number>(0);
  comicStateMaxX = 0;

  constructor(
    private logger: LoggerService,
    private translateService: TranslateService
  ) {
    this.logger.trace('Subscribing to language changes');
    this.langChangeSubscription =
      this.translateService.onDefaultLangChange.subscribe(() =>
        this.loadTranslations()
      );
  }

  private _libraryState: LibraryState = null;

  get libraryState(): LibraryState {
    return this._libraryState;
  }

  @Input() set libraryState(libraryState: LibraryState) {
    this._libraryState = libraryState;
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.logger.trace('Unsubscribing from language changes');
    this.langChangeSubscription.unsubscribe();
  }

  loadTranslations(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    this.loadComponentDimensions();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResized(_event: any): void {
    this.loadComponentDimensions();
  }

  private loadStatistics(): void {
    this.comicStateData = [
      {
        name: this.translateService.instant('home.label.comic-state-added'),
        value: this.getCountForState(
          this.libraryState.states,
          ComicBookState.ADDED
        )
      },
      {
        name: this.translateService.instant(
          'home.label.comic-state-unprocessed'
        ),
        value: this.getCountForState(
          this.libraryState.states,
          ComicBookState.UNPROCESSED
        )
      },
      {
        name: this.translateService.instant('home.label.comic-state-stable'),
        value: this.getCountForState(
          this.libraryState.states,
          ComicBookState.STABLE
        )
      },
      {
        name: this.translateService.instant('home.label.comic-state-changed'),
        value: this.getCountForState(
          this.libraryState.states,
          ComicBookState.CHANGED
        )
      },
      {
        name: this.translateService.instant('home.label.comic-state-deleted'),
        value: this.getCountForState(
          this.libraryState.states,
          ComicBookState.DELETED
        )
      }
    ];
    this.comicStateMaxX = this.comicStateData
      .map(data => data.value)
      .sort()
      .reverse()[0];
  }

  private loadComponentDimensions(): void {
    /* istanbul ignore next */
    this.chartWidth$.next(this.container?.nativeElement?.offsetWidth);
    /* istanbul ignore next */
    let height = this.container?.nativeElement?.offsetHeight - 100;
    /* istanbul ignore if */
    if (height < 0) {
      height = 0;
    }
    this.chartHeight$.next(height);
  }

  private getCountForState(
    states: RemoteLibrarySegmentState[],
    state: ComicBookState
  ): number {
    const entry = states.find(record => record.name === state);
    return !!entry ? entry.count : 0;
  }
}
