import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Socket } from "ng-socket-io";
import { Http} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HomePage} from '../home/home'
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
import { FuncProvider} from '../../providers/func/func'
/**
 * Generated class for the ValidasiPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-validasi',
  templateUrl: 'validasi.html',
})
export class ValidasiPage {
	order : any = ""
	isValid : any = false
  status : any = "open"
	idOrder : any;
  resto : any = "";
  buttonBack : any = false
  constructor(public func : FuncProvider,public toastCtrl: ToastController,public storage : Storage,private http : Http,public socket : Socket,public navCtrl: NavController, public navParams: NavParams) {
    this.order = this.navParams.data.temp
    this.isValid = this.order.isAuth
    this.status = this.order.status
    this.idOrder = this.navParams.data.idOrder
    this.buttonBack = this.navParams.data.buttonBack
    if(typeof this.order.data=='string')
      this.order.data = JSON.parse(this.order.data)
    this.http.get(this.func.url+'/getdata/'+this.order.idOwner).subscribe(data=>{
      this.resto = data.json();
    })
    this.http.post(this.func.url+'/getOrder',{idOrder : this.idOrder}).subscribe(data=>{
      this.order = data.json();
      this.order.data = JSON.parse(this.order.data)
      this.isValid = this.order.isAuth
      this.status = this.order.status
    })
  	this.getAuth().subscribe(valid=>{
  		this.isValid = valid
  		if(this.isValid==true){
  			this.http.post(this.func.url+'/getOrder',{idOrder : this.idOrder}).subscribe(data=>{
  				this.order = data.json();
          if(typeof this.order.data=='string')
            this.order.data = JSON.parse(this.order.data)
  			})
  		}
      else if(this.isValid == false){
        this.status = 'closed'
      }
  	})
    this.triger().subscribe(data=>{
      if(data){
        this.http.post(this.func.url+'/getOrder',{idOrder : this.idOrder}).subscribe(data=>{
          this.order = data.json();
          this.order.data = JSON.parse(this.order.data)
          this.isValid = this.order.isAuth
          this.status = this.order.status
        })
      }
    })
  	// this.updateStatus().subscribe(data=>{
  	// 	this.order = data;
   //    console.log(this.order)

  	// })
  }
  triger(){
    let observable = new Observable(observer=>{
      this.socket.on('trigerPembuatan',data=>{
        observer.next(data)
      })
    })
    return observable
  }
  getAuth(){
  	let observable = new Observable(observer=>{
  		this.socket.on('isValid'+this.idOrder,(data)=>{
  			observer.next(data)
  		})
  	})
  	return observable
  }
  // updateStatus(){
  // 	let observable = new Observable(observer=>{
  // 		this.socket.on('updateStatus',data=>{
  // 			for(var i=0;i<data.length;i++){
	 //  			if(data[i].idOrder==this.idOrder){
	 //  				data = data[i]
	 //  				if(typeof data.data=='string')
  //             data.data = JSON.parse(data.data)
	 //  			}
	 //  		}
	 //  		observer.next(data)
  // 		})
  // 	})
  // 	return observable
  // }
  batal(idOrder){
    this.http.post(this.func.url+'/batalPesanan',{idOrder:idOrder}).subscribe(data=>{
      let Data = data.json()
      if(Data.berhasilBatal){
        this.order.statusOrder = 'dibatalkan'
        const toast = this.toastCtrl.create({
          message: 'Pesanan anda telah dibatalkan',
          showCloseButton: true,
          closeButtonText: 'OK'
        });
        toast.present();
      }
    })
  }
  back(){
  	this.navCtrl.setRoot(HomePage)
  }
  bayar(){
    this.order.isBayar=true
    this.order.telahBayar==false
  	this.socket.emit('bayar',{idOrder : this.idOrder,idOwner : this.order.idOwner})
  }
}
