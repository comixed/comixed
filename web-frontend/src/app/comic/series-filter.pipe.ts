import {Pipe, PipeTransform} from '@angular/core';

import {Comic} from './comic.model';

@Pipe({
  name: 'series_filter'
})
export class SeriesFilterPipe implements PipeTransform {
  transform(comics: any[], search_terms: string): any[] {
    if (!comics) {
      return [];
    }
    if (!search_terms) {
      return comics;
    }

    search_terms = search_terms.toLowerCase();

    return comics.filter((comic: Comic) => {
      return (comic.series && comic.series.length > 0);
    }).filter((comic: Comic) => {
      return comic.series.toLowerCase().includes(search_terms);
    });
  }
}
