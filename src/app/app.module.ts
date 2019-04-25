import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login'
import { RegisterPage } from '../pages/register/register'
import { UserPage } from '../pages/user/user'
import { DetailPage } from '../pages/detail/detail'
import { SearchPage } from '../pages/search/search'
import { InsidePage } from '../pages/inside/inside'
import { OrderPage } from '../pages/order/order'
import {CartPage} from '../pages/cart/cart';
import {ValidasiPage} from '../pages/validasi/validasi'
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { FuncProvider } from '../providers/func/func';
import { IonicStorageModule } from '@ionic/storage';
import { NavKerenDirective } from '../directives/nav-keren/nav-keren'
import { Geolocation } from '@ionic-native/geolocation';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
const config: SocketIoConfig = { url: 'http://192.168.43.20:3000', options: {} };
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    RegisterPage,
    DetailPage,
    UserPage,
    SearchPage,
    InsidePage,
    NavKerenDirective,
    CartPage,
    OrderPage,
    ValidasiPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    SocketIoModule.forRoot(config)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    RegisterPage,
    DetailPage,
    UserPage,
    SearchPage,
    InsidePage,
    CartPage,
    OrderPage,
    ValidasiPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FuncProvider,
    Geolocation,
    BarcodeScanner,
    LaunchNavigator
  ]
})
export class AppModule {}
