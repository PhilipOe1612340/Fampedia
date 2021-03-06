import { Component } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { StorageService } from './storage/storage.service';
import { Router, RouterState, ActivatedRoute, Scroll, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { CoreService, EUpdateType } from './core/core.service';
import { LoginService } from './login/login.service';

@Component({
    selector: 'fampedia-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private translate: TranslateService, private router: Router, private titleService: Title,
        storage: StorageService, viewportScroller: ViewportScroller, private socket: Socket, private core: CoreService,
        private login: LoginService) {
        console.log('%cfampedia', 'font-size:40px');

        this.updateTitle();

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.addLangs(['de', 'en', 'pt']);

        // load language from the storage service
        translate.use('en');

        translate.onLangChange.subscribe((changeLang: LangChangeEvent) => {
            storage.setSetting('language', changeLang.lang);
            this.updateTitle();
        });

        translate.missingTranslationHandler = {
            handle: (context) => {
                console.error('missing translation key: ' + context.key);
                const dotPosition = context.key.indexOf('.');
                if (dotPosition > -1 && dotPosition + 1 < context.key.length) {
                    return context.key.slice(dotPosition + 1);
                }
                return context.key;
            }
        };

        router.events.subscribe(() => {
            this.updateTitle();
        });

        router.events
            .pipe(filter((e) => e instanceof Scroll))
            .subscribe((e: any) => {
                const resetRoutes = /(moment\/(image\/\d+|\d+)|new)/
                // should match:
                //   /moment/5
                //   /new
                //   /moment/image/5

                if (resetRoutes.test(e.routerEvent.url)) {
                    viewportScroller.scrollToPosition([0, 0]);
                } else {
                    viewportScroller.scrollToPosition(e.position || [0, 0]);
                }
            });

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && (<any>window).ga) {
                (<any>window).ga('set', 'page', event.urlAfterRedirects);
                (<any>window).ga('send', 'pageview');
            }
        });

        this.login.user$.subscribe((user) => {
            if (user) {
                this.socket.ioSocket.nsp = "/" + user.familyID;

                this.socket.on(EUpdateType.comment, () => {
                    console.log("socket", EUpdateType.comment);
                    this.core.updatesAvaliable$.next(EUpdateType.comment);
                });

                this.socket.on(EUpdateType.moment, () => {
                    console.log("socket", EUpdateType.moment);
                    this.core.getMoments().subscribe();
                });

                this.socket.on(EUpdateType.news, () => {
                    console.log("socket", EUpdateType.news);
                    this.core.getNews().subscribe();
                });

            }
        })

        // this.socket.on(EUpdateType.comment, () => {
        //     console.log("socket", EUpdateType.comment);
        //     this.core.updatesAvaliable$.next(EUpdateType.comment);
        // });

        // this.socket.on(EUpdateType.moment, () => {
        //     console.log("socket", EUpdateType.moment);
        //     this.core.getMoments().subscribe();
        // });

        // this.socket.on(EUpdateType.news, () => {
        //     console.log("socket", EUpdateType.news);
        //     this.core.getNews().subscribe();
        // });
    }

    private async updateTitle() {
        const title = await this.translate.get(
            'titles.' + this.getFirstModule(this.router.routerState, this.router.routerState.root)
        ).toPromise();
        this.titleService.setTitle('Fampedia' + (title ? " | " : "") + title);
    }

    private getFirstModule(state: RouterState, parent: ActivatedRoute | null): string | undefined {
        if (parent) {
            if (parent.snapshot && parent.snapshot.data && parent.snapshot.data.title) {
                return parent.snapshot.data.title;
            } else {
                return this.getFirstModule(state, parent.firstChild);
            }
        }
        return;
    }
}
