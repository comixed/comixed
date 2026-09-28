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

import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MenuItem } from '@openng/optimus-ui/api';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TitleService } from '@app/layout/services/title-service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Breadcrumb } from '@openng/optimus-ui/breadcrumb';
import { Card } from '@openng/optimus-ui/card';
import { TableModule } from '@openng/optimus-ui/table';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Checkbox } from '@openng/optimus-ui/checkbox';
import { Button } from '@openng/optimus-ui/button';
import { MetadataSourceProperty } from '@app/metadata/models/metadata-source-property';
import { Store } from '@ngrx/store';
import { selectMetadataSourceListEntries } from '@app/metadata/selectors/metadata-source-list.selectors';
import { MetadataSource } from '@app/metadata/models/metadata-source';
import { MetadataSourceListActions } from '@app/metadata/actions/metadata-source-list.actions';
import { Actions, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';

@Component({
  imports: [
    Breadcrumb,
    Card,
    TableModule,
    ReactiveFormsModule,
    InputText,
    TranslatePipe,
    Checkbox,
    Button
  ],
  selector: 'app-metadata-source-page',
  styleUrl: './metadata-source-page.scss',
  templateUrl: './metadata-source-page.html'
})
export class MetadataSourcePage implements OnInit {
  readonly logger = inject(LoggerService);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly translateService = inject(TranslateService);
  readonly titleService = inject(TitleService);
  readonly confirmationService = inject(ConfirmationService);
  readonly sourceEntry = signal<MetadataSource | null>(null);
  readonly sourceName = signal('');
  readonly sourceEntries = signal<MetadataSource[]>([]);
  readonly sourceProperties = signal<MetadataSourceProperty[]>([]);
  readonly store = inject(Store);
  readonly formBuilder = inject(FormBuilder);
  readonly actions = inject(Actions);
  readonly router = inject(Router);

  readonly home: MenuItem = { icon: 'pi pi-home', routerLink: ['/'] };
  readonly trail = signal<MenuItem[]>([]);

  sourceForm: FormGroup;

  constructor() {
    this.sourceForm = this.formBuilder.group({
      sourceName: new FormControl(''),
      preferred: new FormControl(false),
      properties: this.formBuilder.array([])
    });

    this.activatedRoute.params.pipe(takeUntilDestroyed()).subscribe({
      next: params => {
        this.sourceName.set(params['sourceName']);
        this.doLoadSourceForm();
        this.doLoadTranslations();
      }
    });
    this.store
      .select(selectMetadataSourceListEntries)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: entries => {
          this.sourceEntries.set(entries);
          this.source =
            entries.find(entry => entry.name === this.sourceName()) || null;
          this.doLoadTranslations();
          this.doLoadSourceForm();
        }
      });
    this.actions
      .pipe(
        ofType(MetadataSourceListActions.saveSuccess),
        tap(() => {
          this.logger.trace('Source saved, redirecting back to the list...');
          this.router.navigateByUrl('/admin/settings/metadata');
        }),
        takeUntilDestroyed()
      )
      .subscribe();
    this.translateService.onLangChange.subscribe({
      next: () => this.doLoadTranslations()
    });
  }

  set source(source: MetadataSource | null) {
    this.sourceEntry.set(source);
    this.doLoadSourceForm();
  }

  get properties(): FormArray {
    return this.sourceForm.controls['properties'] as FormArray;
  }

  ngOnInit(): void {
    this.logger.trace('Loading metadata sources');
    this.store.dispatch(MetadataSourceListActions.load());
  }

  onResetForm(): void {
    this.doLoadSourceForm();
  }

  onSubmitForm(): void {
    const sourceName = this.sourceForm.controls['sourceName'].value;
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'metadata-source-page.submit-form.confirmation-title',
        { sourceName }
      ),
      message: this.translateService.instant(
        'metadata-source-page.submit-form.confirmation-message'
      ),
      accept: () => {
        const source = this.doEncodeForm();
        this.logger.debug('Saving metadata source adaptor:', source);
        this.store.dispatch(MetadataSourceListActions.save({ source }));
      }
    });
  }

  private doAddProperty(name: string, value: string): FormGroup {
    return this.formBuilder.group({
      propertyName: [name, Validators.required],
      propertyValue: [value, Validators.required]
    });
  }

  private doLoadTranslations() {
    this.titleService.setTitle(
      this.translateService.instant('metadata-source-page.page-title', {
        sourceName: this.sourceName()
      })
    );
    this.trail.set([
      {
        label: this.translateService.instant('settings.trail-title', {
          source: this.sourceName()
        })
      },
      {
        label: this.translateService.instant(
          'metadata-source-list-page.trail-title'
        ),
        routerLink: ['/admin/settings/metadata']
      },
      {
        label: this.sourceName()
      },
      {
        label: this.translateService.instant(
          `metadata-source-page.${this.sourceEntry() === null ? 'new-trail' : 'edit-trail'}`
        )
      }
    ]);
  }

  private doLoadSourceForm() {
    this.sourceForm.controls['sourceName'].setValue(
      this.sourceEntry()?.name || ''
    );
    this.sourceForm.controls['preferred'].setValue(
      this.sourceEntry()?.preferred || false
    );
    while (this.properties.length > 0) {
      this.properties.removeAt(0);
    }
    this.properties.reset([]);
    if ((this.sourceEntry()?.properties || []).length > 0) {
      this.sourceEntry()!.properties.forEach(property =>
        this.properties.push(this.doAddProperty(property.name, property.value))
      );
    }
    this.sourceProperties.set(this.sourceEntry()?.properties || []);
    this.sourceForm.markAsPristine();
    this.sourceForm.markAsUntouched();
  }

  doEncodeForm(): MetadataSource {
    return {
      ...this.sourceEntry(),
      name: this.sourceForm.controls['sourceName'].value,
      preferred: this.sourceForm.controls['preferred'].value || false,
      properties: this.properties.controls.map(control => {
        return {
          name: control.value.propertyName,
          value: control.value.propertyValue
        } as MetadataSourceProperty;
      })
    } as MetadataSource;
  }
}
