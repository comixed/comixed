import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromScrapingIssues from '../reducers/scraping-issues.reducer';

export const selectScrapingIssuesState = createFeatureSelector<fromScrapingIssues.ScrapingIssueState>(
  fromScrapingIssues.SCRAPING_ISSUE_FEATURE_KEY
);
