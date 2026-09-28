/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublisherYearStatistics } from '@app/dashboard/components/publisher-year-statistics/publisher-year-statistics';
import { provideTranslateService } from '@ngx-translate/core';

describe('PublisherYearStatistics', () => {
  let component: PublisherYearStatistics;
  let fixture: ComponentFixture<PublisherYearStatistics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublisherYearStatistics],
      providers: [provideTranslateService({ fallbackLang: 'en' })]
    }).compileComponents();

    fixture = TestBed.createComponent(PublisherYearStatistics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
