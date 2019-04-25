import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http} from '@angular/http';
import { Storage } from '@ionic/storage';
import {ValidasiPage} from '../validasi/validasi'
import { FuncProvider} from '../../providers/func/func'
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  icons: string[];
  items: Array<{title: string, note: string, icon: string}>;
  idUser : any;
  myOrder : any = "";
  constructor(public func : FuncProvider,public storage : Storage,private http : Http,public navCtrl: NavController, public navParams: NavParams) {
    this.storage.get('user').then(data=>{
      this.idUser = data.email
      this.http.get(this.func.url+'/history/'+this.idUser).subscribe(data=>{
        this.myOrder = data.json()
        for(var i=0;i<this.myOrder.length;i++){
          let k = new Date(Date.parse(this.myOrder[i].timeOrder))
          let waktu = k.toLocaleTimeString()
          let date = k.toDateString()
          this.myOrder[i].timeOrder = date + ' ' + waktu 
        }
      })
    })
  }
  doRefresh(refresher) {
    this.http.get(this.func.url+'/history/'+this.idUser).subscribe(data=>{
      this.myOrder = data.json()
      for(var i=0;i<this.myOrder.length;i++){
        let k = new Date(Date.parse(this.myOrder[i].timeOrder))
        let waktu = k.toLocaleTimeString()
        let date = k.toDateString()
        this.myOrder[i].timeOrder = date + ' ' + waktu 
      }
    })

    setTimeout(() => {
      if(refresher!=0)
        refresher.complete();
    }, 1000);
  }
  ionViewWillEnter(){
    this.storage.get('user').then(data=>{
      this.idUser = data.email
      this.http.get(this.func.url+'/history/'+this.idUser).subscribe(data=>{
        this.myOrder = data.json()
        for(var i=0;i<this.myOrder.length;i++){
          let k = new Date(Date.parse(this.myOrder[i].timeOrder))
          let waktu = k.toLocaleTimeString()
          let date = k.toDateString()
          this.myOrder[i].timeOrder = date + ' ' + waktu 
        }
      })
    })
  }
  toDetail(i){
    this.navCtrl.push(ValidasiPage,{temp:this.myOrder[i],idOrder : this.myOrder[i].idOrder,buttonBack : false})
  }
}
