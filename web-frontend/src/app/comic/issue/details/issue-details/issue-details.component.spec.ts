/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  async,
  fakeAsync,
  tick,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IssueDetailsComponent } from './issue-details.component';

fdescribe('IssueDetailsComponent', () => {
  const TEST_TITLE_VALUE = 'Test comic title';
  const TEST_SUBTITLE_VALUE = 'Test comic subtitle';
  const TEST_COVER_IMAGE_URL = 'http://localhost:7171/api/page/15/content';

  let component: IssueDetailsComponent;
  let fixture: ComponentFixture<IssueDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IssueDetailsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('displays the supplied title for a single comic', fakeAsync(() => {
    component.title = TEST_TITLE_VALUE;
    fixture.detectChanges();


    expect(fixture.debugElement.query(By.css('#issue-details-title'))).not.toBe(null);
    expect(fixture.debugElement.query(By.css('#issue-details-title')).nativeElement.textContent.trim()).toContain(TEST_TITLE_VALUE);
  }));

  it('displays the supplied subtitle for a single comic', fakeAsync(() => {
    component.subtitle = TEST_SUBTITLE_VALUE;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#issue-details-subtitle'))).not.toBe(null);
    expect(fixture.debugElement.query(By.css('#issue-details-subtitle')).nativeElement.textContent.trim()).toContain(TEST_SUBTITLE_VALUE);
  }));

  it('displays the supplied image for a single comic', fakeAsync(() => {
    component.cover_url = TEST_COVER_IMAGE_URL;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('img#issue-details-cover'))).not.toBe(null);
    expect(fixture.debugElement.query(By.css('img#issue-details-cover')).nativeElement.src).toContain(TEST_COVER_IMAGE_URL);
  }));

  it('sends a notification when the close button is clicked', fakeAsync(() => {
    let passed = false;

    component.close.subscribe((event) => {
      passed = true;
    });

    fixture.debugElement.query(By.css('#issue-details-close-button')).nativeElement.click();
    tick();

    expect(passed).toBe(true);
  });
});
