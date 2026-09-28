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
import { DashboardPage } from '@app/dashboard/pages/dashboard-page/dashboard-page';
import { provideTranslateService } from '@ngx-translate/core';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideRouter } from '@angular/router';
import { beforeEach, Mock } from 'vitest';

describe('DashboardPage', () => {
  const TEST_TITLE_TRANSLATED = 'The Translated Title';

  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([{ path: '*', redirectTo: '' }]),
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService({ fallbackLang: 'en' })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      component.translateService.use('fr');
    });

    it('updates the title', () => {
      expect(setTitleSpy).toHaveBeenCalled();
    });
  });

  describe('when the language changes', () => {
    let setTitleSpy: Mock;
    let instantSpy: Mock;

    beforeEach(() => {
      setTitleSpy = vi.spyOn(component.titleService, 'setTitle');
      instantSpy = vi
        .spyOn(component.translateService, 'instant')
        .mockReturnValue(TEST_TITLE_TRANSLATED);
      component.translateService.use('fr');
    });

    it('translates the title', () => {
      expect(instantSpy).toHaveBeenCalled();
    });

    it('updates the title', () => {
      expect(setTitleSpy).toHaveBeenCalledWith(TEST_TITLE_TRANSLATED);
    });
  });
});
