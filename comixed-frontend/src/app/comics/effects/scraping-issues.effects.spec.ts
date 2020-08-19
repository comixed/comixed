import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ScrapingIssuesEffects } from './scraping-issues.effects';

describe('ScrapingIssuesEffects', () => {
  let actions$: Observable<any>;
  let effects: ScrapingIssuesEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScrapingIssuesEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get<ScrapingIssuesEffects>(ScrapingIssuesEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
