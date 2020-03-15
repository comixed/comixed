import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertComicsSettingsComponent } from './convert-comics-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserModule } from 'app/user/user.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { ComicsModule } from 'app/comics/comics.module';

fdescribe('ConvertComicsSettingsComponent', () => {
  let component: ConvertComicsSettingsComponent;
  let fixture: ComponentFixture<ConvertComicsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UserModule,
        ComicsModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        LoggerTestingModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        DropdownModule,
        ButtonModule,
        CheckboxModule
      ],
      declarations: [ConvertComicsSettingsComponent],
      providers: [
        ConfirmationService,
        MessageService,
        LibraryAdaptor,
        SelectionAdaptor
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertComicsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
