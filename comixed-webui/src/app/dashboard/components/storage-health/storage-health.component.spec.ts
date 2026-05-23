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
import { StorageHealthComponent } from './storage-health.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { ServerHealth } from '@app/admin/models/server-health';

describe('StorageHealthComponent', () => {
  const TEST_FREE_SPACE = 10 * 1024 * 1024 * 1024 * 1024;
  const TEST_TOTAL_SPACE = 2 * TEST_FREE_SPACE;
  const SERVER_HEALTH = {
    components: {
      diskSpace: {
        details: {
          free: TEST_FREE_SPACE,
          total: TEST_TOTAL_SPACE
        }
      }
    }
  } as ServerHealth;

  let component: StorageHealthComponent;
  let fixture: ComponentFixture<StorageHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StorageHealthComponent,
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StorageHealthComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides chart options', () => {
    expect(component.chartOptions).toBeTruthy();
  });

  describe('processing data', () => {
    beforeEach(() => {
      component.chartData.next([]);
      component.health = SERVER_HEALTH;
    });

    it('stores the data', () => {
      expect(component.chartData.value).not.toBeNull();
    });
  });
});
