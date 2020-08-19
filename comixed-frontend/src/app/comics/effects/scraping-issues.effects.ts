import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import * as ScrapingIssuesActions from '../actions/scraping-issue.actions';



@Injectable()
export class ScrapingIssuesEffects {

  loadScrapingIssuess$ = createEffect(() => {
    return this.actions$.pipe( 

      ofType(ScrapingIssuesActions.getScrapingIssue),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map(data => ScrapingIssuesActions.scrapingIssueReceived({ data })),
          catchError(error => of(ScrapingIssuesActions.getScrapingIssueFailed({ error }))))
      )
    );
  });



  constructor(private actions$: Actions) {}

}
