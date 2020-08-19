import * as fromScrapingIssues from '../reducers/scraping-issues.reducer';
import { selectScrapingIssuesState } from './scraping-issues.selectors';

describe('ScrapingIssues Selectors', () => {
  it('should select the feature state', () => {
    const result = selectScrapingIssuesState({
      [fromScrapingIssues.SCRAPING_ISSUE_FEATURE_KEY]: {}
    });

    expect(result).toEqual({});
  });
});
