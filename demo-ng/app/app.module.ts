import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { ItemDetailComponent } from './item/item-detail.component';
import { ItemService } from './item/item.service';
import { CardStackModule } from 'nativescript-card-stack-view/angular/index';
import { ItemsComponent } from '~/item/items.component';

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpModule } from "nativescript-angular/http";

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    CardStackModule
  ],
  declarations: [AppComponent, ItemsComponent, ItemDetailComponent],
  providers: [ItemService],
  schemas: [NO_ERRORS_SCHEMA]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule {
}
