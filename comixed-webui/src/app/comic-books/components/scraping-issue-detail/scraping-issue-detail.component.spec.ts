/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrapingIssueDetailComponent } from './scraping-issue-detail.component';
import { LoggerModule } from '@angular-ru/logger';
import { ScrapingIssueTitlePipe } from '@app/comic-books/pipes/scraping-issue-title.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { SCRAPING_ISSUE_1 } from '@app/comic-books/comic-books.fixtures';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ComicPageComponent } from '@app/comic-books/components/comic-page/comic-page.component';
import { MatIconModule } from '@angular/material/icon';
import { provideMockStore } from '@ngrx/store/testing';
import {
  USER_FEATURE_KEY,
  initialState as initialUserState
} from '@app/user/reducers/user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ScrapingIssueDetailComponent', () => {
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;
  const USER = USER_READER;
  const initialState = {
    [USER_FEATURE_KEY]: { ...initialUserState, user: USER }
  };

  let component: ScrapingIssueDetailComponent;
  let fixture: ComponentFixture<ScrapingIssueDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ScrapingIssueDetailComponent,
        ComicPageComponent,
        ScrapingIssueTitlePipe
      ],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [provideMockStore({ initialState })]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrapingIssueDetailComponent);
    component = fixture.componentInstance;
    component.issue = SCRAPING_ISSUE;
    spyOn(component.decision, 'emit');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selecting the issue', () => {
    beforeEach(() => {
      component.onSelect();
    });

    it('emits an event', () => {
      expect(component.decision.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('rejecting the issue', () => {
    beforeEach(() => {
      component.onReject();
    });

    it('emits an event', () => {
      expect(component.decision.emit).toHaveBeenCalledWith(false);
    });
  });
});
