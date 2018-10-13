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

import { BusyIndicatorComponent } from './busy-indicator.component';
import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoadingModule } from 'ngx-loading';
import { AlertService } from '../alert.service';
import { By } from '@angular/platform-browser';

describe('BusyIndicatorComponent', () => {
  let component: BusyIndicatorComponent;
  let fixture: ComponentFixture<BusyIndicatorComponent>;
  let alert_service: AlertService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        LoadingModule,],
      declarations: [
        BusyIndicatorComponent,
      ],
      providers: [
        AlertService,
        LoadingModule,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusyIndicatorComponent);
    component = fixture.componentInstance;
    alert_service = TestBed.get(AlertService);
    fixture.detectChanges();
  });

  it('should show and hide the busy overlay', fakeAsync(() => {
    const expected: string = "This is a busy message";

    expect(component.is_busy()).toBe(false);

    alert_service.show_busy_message(expected);
    component.ngOnInit();

    fixture.detectChanges();
    tick();

    expect(component.is_busy()).toBe(true);
    expect(fixture.debugElement.query(By.css('#busy-message-container'))).not.toBe(null);
    expect(fixture.debugElement.query(By.css('h1')).nativeElement.textContent.trim()).toContain(expected);

    alert_service.show_busy_message('');

    fixture.detectChanges();
    tick();

    expect(component.is_busy()).toBe(false);
    expect(fixture.debugElement.query(By.css('#busy-message-container'))).toBe(null);
  }));
});
