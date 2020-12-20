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
import { ScrapingIssueTitlePipe } from '@app/library/pipes/scraping-issue-title.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { SCRAPING_ISSUE_1 } from '@app/library/library.fixtures';

describe('ScrapingIssueDetailComponent', () => {
  const SCRAPING_ISSUE = SCRAPING_ISSUE_1;

  let component: ScrapingIssueDetailComponent;
  let fixture: ComponentFixture<ScrapingIssueDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScrapingIssueDetailComponent, ScrapingIssueTitlePipe],
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()]
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
