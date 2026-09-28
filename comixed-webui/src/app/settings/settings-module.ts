import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { configurationsFeature } from '@app/settings/reducers/configuration.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ConfigurationEffects } from '@app/settings/effects/configuration.effects';
import { metadataSourceListsFeature } from '@app/settings/reducers/metadata-source-list.reducer';
import { MetadataSourceListEffects } from '@app/settings/effects/metadata-source-list.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(configurationsFeature),
    StoreModule.forFeature(metadataSourceListsFeature),
    EffectsModule.forFeature([ConfigurationEffects, MetadataSourceListEffects])
  ]
})
export class SettingsModule {}
