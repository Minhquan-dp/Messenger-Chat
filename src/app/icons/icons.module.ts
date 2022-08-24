import { NgModule } from '@angular/core';

// @ts-ignore
import { FeatherModule } from 'angular-feather';
// @ts-ignore
import { Smile, Mail } from 'angular-feather/icons';

// Select some icons (use an object, not an array)
const icons = {
  Smile, Mail
};

@NgModule({
  imports: [
    FeatherModule.pick(icons)
  ],
  exports: [
    FeatherModule
  ]
})
export class IconsModule { }

