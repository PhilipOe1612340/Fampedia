import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ErrorService } from './error/shared/error.service';
import { ExceptionComponent } from './error/exception/exception.component';
import { AppComponent } from './app.component';

import { MaterialModule } from './material/material.module';
import { RoutingModule } from './routing/routing.module';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/locale/', '.json');
}

import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotFoundModule } from './not-found/not-found.module';

declare var Hammer: any;
export class MyHammerConfig extends HammerGestureConfig {
    /**
     * https://github.com/hammerjs/hammer.js/issues/1014#issuecomment-372513548
     * @param element
     */
    buildHammer(element: HTMLElement) {
        let options = {};
        if ((<any>element).attributes['mc-touch-actions']) {
            try {
                options = { touchAction: (<any>element).attributes['mc-touch-actions'].nodeValue };
            } catch (err) {
                console.error('An error occurred when attempting to parse Hammer.js options: ', err);
            }
        }

        const mc = new Hammer(element, options);

        // retain support for angular overrides object
        for (const eventName in this.overrides) {
            if (eventName) {
                mc.get(eventName).set((<any>this.overrides)[eventName]);
            }
        }

        return mc;
    }
}

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        RoutingModule,
        NotFoundModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
    ],
    declarations: [
        ExceptionComponent,
        AppComponent,
        DashboardComponent,
    ],
    providers: [
        { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig, },
        { provide: ErrorHandler, useClass: ErrorService }
    ],
    entryComponents: [
        ExceptionComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
