import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { configurationsFeature } from '@app/settings/reducers/configuration.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ConfigurationEffects } from '@app/settings/effects/configuration.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(configurationsFeature),
    EffectsModule.forFeature([ConfigurationEffects])
  ]
})
export class SettingsModule {}
