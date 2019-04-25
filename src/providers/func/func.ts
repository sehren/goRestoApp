import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AlertController,LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/map';

/*
  Generated class for the FuncProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FuncProvider {
	Alert : any;
	tokenKey = [];
  url : any = "http://192.168.43.20:3000"
  constructor(public storage : Storage,public http: Http,public alert : AlertController,public loadingCtrl : LoadingController) {
  }
  loadingFunc(text){
  	let loader = this.loadingCtrl.create({
  		content : text,
  		dismissOnPageChange: true
  	})
  	loader.present();
  }
  alertFunc(text){
  	this.Alert = this.alert.create({
  		title : text,
  		buttons : ['OK']
  	})
  	this.Alert.present()
  }
  confirmAlert(title,msg){
    this.Alert = this.alert.create({
      title:title,
      message : msg,
      buttons: [
        {
          text: 'TIDAK',
          role: 'cancel',
          handler: () => {
            return false;
          }
        },
        {
          text: 'YA',
          handler: () => {
            return true;
          }
        }
      ]
    })
    this.Alert.present()
  }
  setData(key,data){
  	this.storage.set(key,data);
  }
  getData(key){
  	this.storage.get(key).then(data=>{
  		return data;
  	})
  }
  clearStore(){
  	this.storage.clear();
  }
}
