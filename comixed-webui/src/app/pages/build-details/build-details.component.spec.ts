/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BuildDetailsComponent } from './build-details.component';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  RELEASE_DETAILS_FEATURE_KEY,
  initialState as initialBuildState
} from '@app/reducers/release.reducer';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CURRENT_RELEASE } from '@app/app.fixtures';
import { MatCardModule } from '@angular/material/card';
import { TitleService } from '@app/core/services/title.service';

describe('BuildDetailsComponent', () => {
  const initialState = {
    [RELEASE_DETAILS_FEATURE_KEY]: {
      ...initialBuildState,
      current: CURRENT_RELEASE
    }
  };

  let component: BuildDetailsComponent;
  let fixture: ComponentFixture<BuildDetailsComponent>;
  let titleService: TitleService;
  let translateService: TranslateService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BuildDetailsComponent],
        imports: [
          LoggerModule.forRoot(),
          TranslateModule.forRoot(),
          MatCardModule
        ],
        providers: [provideMockStore({ initialState }), TitleService]
      }).compileComponents();

      fixture = TestBed.createComponent(BuildDetailsComponent);
      component = fixture.componentInstance;
      titleService = TestBed.inject(TitleService);
      spyOn(titleService, 'setTitle');
      translateService = TestBed.inject(TranslateService);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the language changes', () => {
    beforeEach(() => {
      translateService.use('fr');
    });

    it('loads the title', () => {
      expect(titleService.setTitle).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
