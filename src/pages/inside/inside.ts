import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides,AlertController} from 'ionic-angular';
import { Http} from '@angular/http';
import { Storage } from '@ionic/storage';
import { CartPage} from '../../pages/cart/cart';
import { FuncProvider} from '../../providers/func/func'

@IonicPage()
@Component({
  selector: 'page-inside',
  templateUrl: 'inside.html',
})
export class InsidePage {
	items : any;
	@ViewChild('mySlider') slider: Slides;
	selectedSegment: string;
	slides: any = [];
  id : any;
  item : any = []
  cart : any = [];
  idUser : any;
  addCart : any = 0;
  resto : any = "";
  isvalid = true;
  constructor(public alert : AlertController,public func : FuncProvider,public storage : Storage,public http : Http,public navCtrl: NavController, public navParams: NavParams) {
    this.id = this.navParams.data.detail;
    this.idUser = this.navParams.data.idUser;
    this.http.get(this.func.url+'/getdata/'+this.id).subscribe(data=>{
      this.resto = data.json();
      if(this.resto.imageName==''){
        this.resto.imageName='No-image.jpg'
      }
    })
    this.http.post(this.func.url+'/inside',{idOwner : this.id}).subscribe(data=>{
      this.items = data.json();
      for(var i = 0; i < this.items.menu.length;i++){
        let temp = []
        for(var j = 0; j <this.items.jenis.length;j++){
          if(this.items.menu[i].idMenu == this.items.jenis[j].idMenu)
            if(this.items.jenis[j].picture=='')
              this.items.jenis[j].picture='food.jpg'
            temp.push(this.items.jenis[j])
        }
        this.slides.push({ id: this.items.menu[i].idMenu,nama : this.items.menu[i].namaMenu,content : temp})
      }
      this.selectedSegment = this.slides[0].id
    })
    this.http.post(this.func.url+'/getcart',{id:this.idUser}).subscribe(data1=>{
      var ini = data1.json()
        this.addCart = ini[0].total;
        this.cart = ini[0].data;
    }) 
  }
  onSegmentChanged(segmentButton) {
    const selectedIndex = this.slides.findIndex((slide) => {
      return slide.id === segmentButton.value;
    });
    this.slider.slideTo(selectedIndex);
  }
  onSlideChanged(slider) {
    const currentSlide = this.slides[slider.getActiveIndex()];
    if(slider.getActiveIndex()!=this.items.menu.length)
      this.selectedSegment = currentSlide.id;
  }
  setTab(id){
    this.selectedSegment = id
  }
  ionViewWillEnter(){
    this.http.get(this.func.url+'/getdata/'+this.id).subscribe(data=>{
      this.resto = data.json();
      if(this.resto.imageName==''){
        this.resto.imageName='No-image.jpg'
      }
    })
      this.http.post(this.func.url+'/getcart',{id:this.idUser}).subscribe(data1=>{
        var ini = data1.json()
        this.cart = ini[0].data;
        if(ini[0]!=undefined)
          this.addCart = ini[0].total;
        else
          this.addCart = 0;
        
      })
  }
  // ionViewWillLeave(){
  //   if(this.isvalid && this.cart!=""){
  //     let keranjang = {total : this.addCart,data : this.cart,idUser : this.idUser,idOwner : this.id}
  //     this.http.post(this.func.url+"/cart",keranjang).subscribe(data=>{

  //     })
  //   }
  // }
  add(id){
    this.http.post(this.func.url+"/checkCart",{idOwner : this.id, idUser : this.idUser}).subscribe(data=>{
      var checkcart = data.json();
      if(checkcart.istrue){
        let Alert = this.alert.create({
          title:"ganti Resto ?",
          message : "anda telah memilih pesanan dari "+checkcart.namaresto+". apakah anda yakin ingin membatalkannya ?",
          buttons: [
            {
              text: 'TIDAK',
              role: 'cancel',
              handler: () => {
                this.isvalid = false;
              }
            },
            {
              text: 'YA',
              handler: () => {
                this.http.post(this.func.url+"/hapusCart",{idUser : this.idUser}).subscribe(data=>{
                  this.isvalid = true;
                  this.addCart = 0;
                  let temp = 0;
                  for(var i = 0;i<this.cart.length;i++){
                    if(this.cart[i].idMakanan==id.idMakanan){
                      temp = 1;
                      this.cart[i].qty+=1;
                      break;
                    }
                  }
                  if(temp==0){
                    this.cart = []
                    this.cart.push({idMakanan : id.idMakanan,qty : 1,price : id.price,nama:id.nama,idUser : this.idUser,idOwner : this.id});
                  }
                  for(var k = 0;k<this.cart.length;k++){
                    this.addCart+=this.cart[k].qty;
                  }
                  let keranjang = {total : this.addCart,data : this.cart,idUser : this.idUser,idOwner : this.id}
                  this.http.post(this.func.url+"/cart",keranjang).subscribe(data=>{
                  })
                })
              }
            }
          ]
        })
        Alert.present()
      }
      else{
        this.isvalid = true;
        this.addCart = 0;
        let temp = 0;
        for(var i = 0;i<this.cart.length;i++){
          if(this.cart[i].idMakanan==id.idMakanan){
            temp = 1;
            this.cart[i].qty+=1;
            break;
          }
        }
        if(temp==0)
          this.cart.push({idMakanan : id.idMakanan,qty : 1,price : id.price,nama:id.nama,idUser : this.idUser,idOwner : this.id});
        for(var k = 0;k<this.cart.length;k++){
          this.addCart+=this.cart[k].qty;
        }
        let keranjang = {total : this.addCart,data : this.cart,idUser : this.idUser,idOwner : this.id}
        this.http.post(this.func.url+"/cart",keranjang).subscribe(data=>{
        })
      }
    })
  }
  goCart(){
    if(this.isvalid && this.cart!=""){
      let keranjang = {total : this.addCart,data : this.cart,idUser : this.idUser,idOwner : this.id}
      this.http.post(this.func.url+"/cart",keranjang).subscribe(data=>{
        this.navCtrl.push(CartPage,{id : this.id})
      })
    }
    else{
      this.navCtrl.push(CartPage,{id : this.id})
    }
  }

}
