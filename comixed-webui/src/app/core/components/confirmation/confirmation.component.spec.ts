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
import { ConfirmationComponent } from './confirmation.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('ConfirmationComponent', () => {
  let component: ConfirmationComponent;
  let fixture: ComponentFixture<ConfirmationComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmationComponent>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationComponent],
      imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('MatDialogRef.close()')
          }
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<ConfirmationComponent>
    >;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when the user confirms', () => {
    beforeEach(() => {
      component.onConfirm();
    });

    it('closes the dialog with true', () => {
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });
  });

  describe('when the user declines', () => {
    beforeEach(() => {
      component.onDecline();
    });

    it('closes the dialog with true', () => {
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});
