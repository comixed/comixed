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
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicStateData } from '@app/models/ui/comic-state-data';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';

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

  private _comics: ComicBook[];

  get comics(): ComicBook[] {
    return this._comics;
  }

  @Input() set comics(comics: ComicBook[]) {
    this._comics = comics;
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
    this.logger.trace('Loading library comic state distribution');
    const comicStateData = [
      {
        name: this.translateService.instant('home.label.comic-state-added'),
        value: this.comics.filter(
          comic => comic.comicState === ComicBookState.ADDED
        ).length
      },
      {
        name: this.translateService.instant(
          'home.label.comic-state-unprocessed'
        ),
        value: this.comics.filter(
          comic => comic.comicState === ComicBookState.UNPROCESSED
        ).length
      },
      {
        name: this.translateService.instant('home.label.comic-state-stable'),
        value: this.comics.filter(
          comic => comic.comicState === ComicBookState.STABLE
        ).length
      },
      {
        name: this.translateService.instant('home.label.comic-state-changed'),
        value: this.comics.filter(
          comic => comic.comicState === ComicBookState.CHANGED
        ).length
      },
      {
        name: this.translateService.instant('home.label.comic-state-deleted'),
        value: this.comics.filter(
          comic => comic.comicState === ComicBookState.DELETED
        ).length
      }
    ];
    this.comicStateData = comicStateData;
    this.comicStateMaxX = comicStateData.map(data => data.value).reverse()[0];
  }

  private loadComponentDimensions(): void {
    this.chartWidth$.next(this.container?.nativeElement?.offsetWidth);
    let height = this.container?.nativeElement?.offsetHeight - 100;
    if (height < 0) {
      height = 0;
    }
    this.chartHeight$.next(height);
  }
}
