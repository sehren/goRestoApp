import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http} from '@angular/http';
import { Storage } from '@ionic/storage';
import { Socket } from "ng-socket-io";
import { ValidasiPage } from '../validasi/validasi'
import { FuncProvider} from '../../providers/func/func'
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {
	cart : any;
	item : any = [];
	id : any= [];
	idOwner : any = 0;
	idUser : any;
  noMeja : any;
  total : any = 0;
  constructor(
    public func : FuncProvider,
    public socket : Socket,
    public storage : Storage,
    public http : Http,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner
    ) {
  	this.idOwner = this.navParams.data.id;
  	this.storage.get('user').then(data=>{
  		this.idUser = data.email;
      this.http.post(this.func.url+'/getcart',{id:data.email}).subscribe(data1=>{
        var ini = data1.json()
        this.cart = ini[0].data;
        if(this.cart[0]!=null)
          this.idOwner = this.cart[0].idOwner
      })
    })
  }
  ionViewWillEnter(){
    this.myDefaultMethodToFetchData();
  }
  myDefaultMethodToFetchData(){
    this.storage.get('user').then(data=>{
      this.idUser = data.email;
      this.http.post(this.func.url+'/getcart',{id:data.email}).subscribe(data1=>{
        var ini = data1.json()
        this.cart = ini[0].data;
        for(let i =0;i<this.cart.length;i++){
          this.total+=this.cart[i].price * this.cart[i].qty
        }
      })
    })
  }
  incDec (index,val) {
    if(val){
      this.cart[index].qty++;
      this.total++
    }
    else
      if(this.cart[index].qty!=1){
        this.cart[index].qty--;
        this.total--
      }
    let totaal = 0
    for(var i=0;i<this.cart.length;i++)
    totaal+=this.cart[i].qty
    this.http.post(this.func.url+"/update-cart",{total : totaal,idOwner : this.idOwner,idUser : this.idUser,data : this.cart}).subscribe(data=>{

    })
  }
  bayar(){
    this.barcodeScanner.scan().then(barcodeData => {
      this.http.post(this.func.url+'/hasilScan',{text : barcodeData.text,idOwner : this.idOwner,idUser : this.idUser}).subscribe(resp=>{
        var dta = resp.json()
        if(dta.status){
          let harga = 0;
          for(let i =0;i<this.cart.length;i++){
            harga+=this.cart[i].price * this.cart[i].qty
            this.cart[i].noMeja = this.noMeja
          }
          let timeOrder = new Date()
          console.log(timeOrder)
          let temp = {idMeja : dta.idMeja,timeOrder : timeOrder,price : harga,idOwner : this.idOwner,data : JSON.stringify(this.cart),idUser : this.idUser,noMeja : dta.noMeja,isAuth : false,status : 'open'}
          this.socket.emit('order',temp)
          let idOrder
          this.socket.on(this.idUser+'sukses',data=>{
            this.http.post(this.func.url+"/hapusCart",{idUser : this.idUser}).subscribe(data1=>{
              idOrder = data.idOrder
              this.navCtrl.setRoot(ValidasiPage,{temp : temp,idOrder : idOrder,buttonBack : true})
            })
          })
        }
        else if(!dta.status){
          this.func.alertFunc(dta.text)
        }
      })
    }).catch(err => {
        console.log('Error', err);
    });
    
  }
  back(){
    this.navCtrl.pop()
  }
  hapus(idMakanan){
    for(let i =0;i<this.cart.length;i++){
      if(this.cart[i].idMakanan == idMakanan){
        this.cart.splice(i,1)
        break;
      }
    }
    this.http.post(this.func.url+'/updateCart',{id:this.idUser,total : this.cart.length,cart : this.cart}).subscribe(dta=>{
    })
  }
}
