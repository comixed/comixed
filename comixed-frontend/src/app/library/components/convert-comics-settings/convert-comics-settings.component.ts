import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { AuthenticationAdaptor } from 'app/user';
import { LibraryAdaptor, SelectionAdaptor } from 'app/library';
import { Comic } from 'app/comics';

export const TARGET_ARCHIVE_TYPE = 'conversion.target-archive-type';
export const RENAME_PAGES_ON_CONVERT = 'conversion.rename-pages';

@Component({
  selector: 'app-convert-comics-settings',
  templateUrl: './convert-comics-settings.component.html',
  styleUrls: ['./convert-comics-settings.component.scss']
})
export class ConvertComicsSettingsComponent implements OnInit, OnDestroy {
  @Output() cancel = new EventEmitter<boolean>();

  conversionForm: FormGroup;
  langChangeSubscription: Subscription;
  archiveTypeOptions: SelectItem[];
  selectedComicsSubscription: Subscription;
  selectedComics: Comic[] = [];

  constructor(
    private logger: LoggerService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private authenticationAdaptor: AuthenticationAdaptor,
    private libraryAdaptor: LibraryAdaptor,
    private selectionAdaptor: SelectionAdaptor
  ) {
    this.conversionForm = this.formBuilder.group({
      archiveType: ['', Validators.required],
      renamePages: ['', Validators.required]
    });
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(
      () => this.loadTranslations()
    );
    this.loadTranslations();
    this.selectedComicsSubscription = this.selectionAdaptor.comicSelection$.subscribe(
      comics => (this.selectedComics = comics)
    );
  }

  ngOnInit() {
    this.conversionForm.controls['archiveType'].setValue(
      this.authenticationAdaptor.getPreference(TARGET_ARCHIVE_TYPE) || 'CBZ'
    );
    this.conversionForm.controls['renamePages'].setValue(
      (this.authenticationAdaptor.getPreference(RENAME_PAGES_ON_CONVERT) ||
        '0') === '1'
    );
  }

  ngOnDestroy() {
    this.langChangeSubscription.unsubscribe();
    this.selectedComicsSubscription.unsubscribe();
  }

  cancelConversion() {
    this.cancel.emit(true);
  }

  private loadTranslations() {
    this.archiveTypeOptions = [
      {
        label: this.translateService.instant(
          'convert-comics-settings.option.cbz'
        ),
        value: 'CBZ'
      },
      {
        label: this.translateService.instant(
          'convert-comics-settings.option.cb7'
        ),
        value: 'CB7'
      }
    ];
  }

  startConversion() {
    this.confirmationService.confirm({
      header: this.translateService.instant(
        'convert-comics-settings.start-conversion.header'
      ),
      message: this.translateService.instant(
        'convert-comics-settings.start-conversion.message',
        {
          count: this.selectedComics.length,
          archiveType: this.conversionForm.controls['archiveType'].value
        }
      ),
      accept: () => {
        const archiveType = this.conversionForm.controls['archiveType'].value;
        const renamePages = this.conversionForm.controls['renamePages'].value;
        this.logger.debug(
          `saving user preferences: archive type=${archiveType} renamePages=${renamePages}`
        );
        this.authenticationAdaptor.setPreference(
          TARGET_ARCHIVE_TYPE,
          archiveType
        );
        this.authenticationAdaptor.setPreference(
          RENAME_PAGES_ON_CONVERT,
          renamePages ? '1' : '0'
        );
        this.logger.info('calling adaptor to start conversion');
        this.libraryAdaptor.convertComics(
          this.selectedComics,
          archiveType,
          renamePages
        );
        this.selectionAdaptor.clearComicSelections();
        this.cancel.emit(true);
      }
    });
  }
}
