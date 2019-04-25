var express = require ('express'),
	mysql = require ('mysql'),
	bodyParser = require('body-parser'),
	nodemailer = require('nodemailer'),
	nunjuks = require('nunjucks'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	cors = require('cors'),
	jwt = require('json-web-token'),
	multer = require('multer'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment'),
	Cryptr = require('cryptr'),
	cryptr = new Cryptr('sehrenKey'+(Math.floor((Math.random() * 100) + 1)))
	encrypmeja = new Cryptr('meja12345'),
	algorithm = require('./algo.js'),
	convert = require('./converter.js'),
	knex = require('knex')({
	client : 'mysql',
	connection : {
		host : 'localhost',
		user : 'root',
		password : '',
		database : 'taDB',
		port : '3306'
	}
});

app.use(bodyParser.json());
app.use(cors())
var PATH_TO_TEMPLATES = '.';
nunjuks.configure( PATH_TO_TEMPLATES,{
	autoescape: true,
	express:app
});

app.post('/login',function(req,res){
	var user = req.body
	knex.select('*').from('user').where({email:user.email,password:user.password}).then(function(check){
		if(JSON.stringify(check)=='[]')
			res.json("unvalid")
		else if(check[0].email==user.email && check[0].isActive){
			res.json({name : check[0].name,email : check[0].email})
		}
		else if(!check[0].isActive){
			res.json('notActive')
		}
	})
})
app.post('/register',function(req,res){
	var user = req.body
	knex.select('*').from('user').where('email',user.email).then(function(check){
		if(JSON.stringify(check)=='[]'){
			var Rand = Math.floor((Math.random() * 10000000) + 1)+"&"+user.email
			knex('user').insert({email:user.email,password:user.password,name:user.name,token : Rand,isActive : 0}).then(function(rows){
				res.json("valid");
				var transporter = nodemailer.createTransport({
				  service: 'gmail',
				  host : 'smtp.gmail.com',
				  port : 465,
				  secure : false,
				  auth: {
				    user: 'infogoresto@gmail.com',
				    pass: 'sukhi123'
				  }
				});
				var mailOptions = {
					from : 'infogoresto@gmail.com',
					to: user.email,
					subject : "hi "+user.name+" Please Activate your Account",
					html : "<p>Click link bellow to Activate your account </p><a href='http://192.168.43.20:3000/register/auth/"+Rand+"'>Click Me<a>"
				}
				transporter.sendMail(mailOptions, function(error, info){
					if (error) {
						console.log(error);
					} else {
						console.log('Email sent: ' + info.response);
					}
				});
			})
		}
		else
			res.json("unvalid")
	})
})

app.get('/register/auth/:token',function(req,res){
 var token = req.params.token
 var pisah = token.split("&")
 knex.select('*').from('user').where('email',pisah[1]).then(function(data){
 	if(data[0].token == token && data[0].isActive==0){
 		knex('user').update('isActive','1').where('email',data[0].email).then(function(rows){
 			res.render('success.html')
 		},err=>{
 			res.render('error.html')
 		})
 	}
 	else if(data[0].isActive==1)
 		res.render('active.html')
 	else
 		res.render('error.html')
 })
},err=>{
	res.render('error.html');
})

app.get("/home",function(req,res){
	knex.select('*').from('usermenu').then(function(data){
		res.end(JSON.stringify(data))
	})
})
app.post('/change-user',function(req,res){
	data = req.body
	knex.select('*').from('user').then(function(row){
		if(data.email!=data.idUser){
			var istr = false
			for(var i=0;i<row.length;i++){
				if(row[i].email==data.email){
					istr = true
					res.send({text : "email sudah digunakan",isvalid : false})
					break;
				}
			}
			if(!istr)
				knex('user').update({email : data.email,name : data.name}).where('email',data.idUser).then(function(ro){
					knex('user').update('password',data.newPass).where({email : data.email,password : data.oldPass}).then(function(success){
						if(success){
							res.send({text : 'data berhasil diubah', isvalid : true})
						}
						else{
							res.send({text:'Password salah',isValid : false})
						}
					})
				})
		}
		else{
			knex('user').update({email : data.email,name : data.name}).where('email',data.idUser).then(function(ro){
				knex('user').update('password',data.newPass).where({email : data.email,password : data.oldPass}).then(function(success){
					if(success){
						res.send({text : 'data berhasil diubah', isvalid : true})
					}
					else{
						res.send({text:'Password salah',isValid : false})
					}
				})
			})
		}
	})
})
app.get("/user-category",function(req,res){
	knex.select('*').from('restoran').where('status','true').then(function(rows){
		var date = moment().format("HH:mm")
		var depan = []
		var belakang = []
		for(var i = 0 ; i<rows.length;i++){
			if(date>rows[i].buka && date<rows[i].tutup){
				rows[i].time = "buka"
				depan.push(rows[i])
			}
			else{
				rows[i].time = "tutup"
				belakang.push(rows[i])
			}
		}
		rows = depan.concat(belakang)
		res.send(rows)
	})
})
app.post('/inside',function(req,res){
	knex.select('*').from('menu').where(req.body).then(function(menu){
		knex.select('*').from('jenis').where(req.body).then(function(jenis){
			res.send({menu : menu,jenis : jenis})
		})
	})
})
app.post('/cart',function(req,res){
	var data = req.body;
	knex.select('*').from('cart').where('idUser',data.idUser).then(function(rows){
		if(rows[0] != undefined){
			var temp = rows[0].data
			knex('cart').update({idUser : data.idUser,idOwner : data.idOwner,total : data.total,data : JSON.stringify(data.data)}).where('idUser',rows[0].idUser).then(function(row){
				res.json()
			})
		}
		else{
			knex('cart').insert({idUser : data.idUser,idOwner : data.idOwner,total : data.total,data : JSON.stringify(data.data)}).then(function(row){
				res.json()
			})
		}
	})
})
app.post('/update-cart',function(req,res){
	var auth = req.session
	data = req.body
	// console.log(data.data)
	knex('cart').update({total : data.total,data : JSON.stringify(data.data)}).where({idOwner : data.idOwner,idUser : data.idUser}).then(function(row){
		res.json()
	})
})

app.post('/getcart',function(req,res){
	var data = req.body
	knex.select('*').from('cart').where('idUser',data.id).then(function(row){
		var data
		if(row[0]!=undefined){
			row[0].data = JSON.parse(row[0].data)
			res.json(row)
		}
		else{
			data = [{data : []}]
			res.json(data)
		}
	})
})
app.post('/updateCart',function(req,res){
	var data = req.body
	// console.log(data.cart)
	if(data.cart==""){
		console.log("masuk")
		knex('cart').where('idUser',data.id).del().then(function(row){
			res.json()
		})
	}
	else
		knex('cart').update({total : data.total,data:JSON.stringify(data.cart)}).where('idUser',data.id).then(function(row){
			res.json()
		})
})
app.get('/getdata/:data',function(req,res){
	var data = req.params.data;
	knex.select('*').from('restoran').where('idOwner',data).then(function(resto){
		var date = moment().format("HH:mm")
		for(var i = 0 ; i<resto.length;i++){
			if(date>resto[i].buka && date<resto[i].tutup){
				resto[i].time = "buka"
			}
			else{
				resto[i].time = "tutup"
			}
		}
		res.json(resto[0])
	})
})
app.get('/history/:data',function(req,res){
	var data = req.params.data
	knex('myorder').join('restoran','restoran.idOwner','=','myorder.idOwner')
	.select('restoran.namaRestoran',
		'myorder.idOrder',
		'myorder.idUser',
		'myorder.idOwner',
		'myorder.data',
		'myorder.isAuth',
		'myorder.noMeja',
		'myorder.price',
		'myorder.status',
		'myorder.statusOrder',
		'myorder.timeOrder').where('idUser',data).then(function(history){
		res.json(history)
	})
})
app.post('/filter',function(req,res){
	knex.select('*').from('menu').where('')
})
app.post('/checkCart',function(req,res){
	var data = req.body
	knex.select('*').from('cart').where('idUser',data.idUser).then(function(rows){
		var istrue = false
		var idowner = data.idOwner;
		for(var i = 0;i<rows.length;i++){
			if(rows[i].idOwner!=data.idOwner){
				istrue = true
				idowner = rows[i].idOwner
				break;
			}
		}
			if(istrue){
				knex.select('namaRestoran').from('restoran').where('idOwner',idowner).then(function(namaResto){
					res.json({istrue : true,idOwner : idowner,namaresto : namaResto[0].namaRestoran})
				})
			}
			else
				res.json({istrue:false,idOwner : idowner})
	})
})
app.post('/hapusCart',function(req,res){
	knex("cart").where("idUser",req.body.idUser).del().then(function(d){
		res.json()
	})
})
app.get('/forget/:token',function(req,res){
	decrypt = cryptr.decrypt(req.params.token)
	knex.select('*').from('owner').where('email',decrypt).then(function(ev){
		if(ev[0]==undefined){
			res.render('error.html')
		}
		else{
			res.render('web/gantiPassword.html',{email : decrypt,encrypt : req.params.token})
		}
	})
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'ssshhhhh'}));
var auth;
app.post('/admin-forget',function(req,res){
	data = req.body
	var encryp = cryptr.encrypt(data.email)
	auth = req.session
	knex.select('*').from('owner').where('email',data.email).then(function(ev){
		if(ev[0]==undefined){
			res.send('Email yang anda masukkan salah')
		}
		else{
			var transporter = nodemailer.createTransport({
			  service: 'gmail',
			  host : 'smtp.gmail.com',
			  port : 465,
			  secure : false,
			  auth: {
			    user: 'infogoresto@gmail.com',
			    pass: 'sukhi123'
			  }
			});
			var mailOptions = {
				from : 'infogoresto@gmail.com',
				to: data.email,
				subject : "goResto Forget Password",
				html : "<p>Click link bellow to reset your password </p><a href='http://localhost:3000/forget/"+encryp+"'>Click Me<a>"
			}
			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					console.log(error);
				} else {
					res.send('Berhasil, Check email anda')
				}
			});
		}
	})
})

app.get('/forget/:token',function(req,res){
	decrypt = cryptr.decrypt(req.params.token)
	knex.select('*').from('owner').where('email',decrypt).then(function(ev){
		if(ev[0]==undefined){
			res.render('error.html')
		}
		else{
			res.render('web/gantiPassword.html',{email : decrypt,encrypt : req.params.token})
		}
	})
})
app.post('/adminforget/:token',function(req,res){
	auth = req.session
	data = req.body
	email = cryptr.decrypt(req.params.token)
	knex('owner').update('password',data.password).where('email',email).then(function(response){
		cryptr = new Cryptr('sehrenKey'+(Math.floor((Math.random() * 100) + 1)))
		res.redirect('/')
	})
})
app.post('/admin-login',function(req,res){
	auth = req.session;
	var data = req.body
	knex.select('*').from('owner').where({email : data.email,password:data.password}).then(function(ev){
		if(ev[0]!=undefined){
			if(ev[0].validasi==1){
				auth.name = ev[0].name
				auth.email = ev[0].email
				auth.islog = true;
				auth.idOwner = ev[0].idOwner;
				res.redirect('/')
			}
			else if(ev[0].validasi == -1){
				auth.islog=false
				res.render('web/index.html',{message:"Admin akan segera validasi Akun anda"})
			}
			else if(ev[0].validasi == 0){
				auth.islog=false
				res.render('web/index.html',{message:"Admin Menolak akun anda"})
			}
			
		}
		else{
			auth.islog=false
			res.render('web/index.html',{message:"Email atau Password salah"})
		}
	})
})
var Storage = multer.diskStorage({
	destination: function(req, file, callback) {
	    callback(null, "web/images/cover-restoran");
	},
	filename: function(req, file, callback) {
	    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
	}
});

var uploading = multer({

    storage : Storage

});
app.get('/register',function(req,res){
	auth = req.session
	if(!auth.islog)
		res.render('web/register.html')
	else
		res.redirect('/')
})

app.post('/admin-register',uploading.fields([{name : 'restoran',maxCount : 1},{name : 'pemilik',maxCount:1}]),function(req,res){
	var data = req.body
	auth = req.session
	var pathRestoran = req.files['restoran'][0].filename
	var pathPemilik = req.files['pemilik'][0].filename
	knex.select('*').from('owner').where('email',data.email).then(function(ev){
		if(ev[0]==undefined){
			knex('owner').insert({name : data.name,email : data.email,password : data.password,validasi : -1}).then(function(rows){
				// auth.email = data.email;
				// auth.name = data.name;
				// auth.idOwner = rows[0]
				// auth.islog = true;
				knex('restoran').insert({namaRestoran : data.namaRestoran,idOwner:rows[0],imageName : pathRestoran,fotoPemilik : pathPemilik}).then(function(resto){
					res.render('web/index.html',{message:"Admin akan segera validasi Akun anda"})
				})
			})
		}
		else{
			auth.islog=false
			res.render('web/register.html',{message:"Email yang sama telah digunakan"})
		}
	})
})


app.post('/getOrder',function(req,res){
	data = req.body
	knex.select('*').from('myorder').where('idOrder',data.idOrder).then(function(row){
		res.send(row[0])
	})
})
io.on('connection',function(socket){
	socket.on('order',(pesan)=>{
		knex('myOrder').insert(pesan).then(function(row){
			knex.select('name').from('user').where('email',pesan.idUser).then(function(name){
				pesan.name = name[0].name
				pesan.idOrder = row[0]
				io.emit(pesan.idUser+'sukses',{idOrder : pesan.idOrder})
				io.emit(pesan.idOwner,{pesan})
				knex.select('doTimeOut').from('owner').where('idOwner',pesan.idOwner).then(function(timeOut){
					if(timeOut[0].doTimeOut == false){
						setTimeout(timeOutOrder,59000,pesan.idOwner)
						knex('owner').update('doTimeOut',true).where('idOwner',pesan.idOwner).then(function(ev){})
					}
				})
			})
		})
	})
	socket.on('isAuth',(pesan)=>{
		knex('myorder').update({isAuth : pesan.isAuth}).where('idOrder',pesan.idOrder).then(function(event){
			io.emit('isValid'+pesan.idOrder,true)
		})
	})
	socket.on('notAuth',(pesan)=>{
		knex('myorder').update({status:'closed',isAuth:false,statusOrder:'ditolak',alasan:pesan.alasan}).where('idOrder',pesan.idOrder).then(function(event){
			knex.select('*').from('myorder').where('idOrder',pesan.idOrder).then(function(semuaorder){
				knex('meja').update({isFull:false,idUser:''}).where('idMeja',semuaorder[0].idMeja).then(function(gg){
					io.emit('trigerPembuatan',{triger:true})
				})
			})
		})
	})
	socket.on('bayar',(id)=>{
		io.emit('toastBayar'+id.idOwner)
		knex('myorder').update({isBayar : true}).where('idOrder',id.idOrder).then(function(event){
			knex.select('*').from('myorder').where({idOwner : id.idOwner,idOrder : id.idOrder,isBayar : true}).then(function(ro){
				io.emit('requestBayar'+id.idOwner,{data : ro})
			})
		})
	})
})
function timeOutOrder(idOwner){
	knex.select('*').from('myorder').where({idOwner : idOwner, statusOrder : 'mengerjakan'}).then(function(statusOrder){
		knex('myorder').update({status : 'closed',statusOrder : statusOrder[0]==null ? 'mengerjakan':'waiting'}).where({status:'open',idOwner:idOwner,isAuth : true}).then(function(data){
			knex('myorder').update({status : 'closed',statusOrder:'ditolak'}).where({status:'open',isAuth:false}).then(function(tolak){
				if(data==true)
					io.emit('triger'+idOwner,{reload : true})
				knex('owner').update('doTimeOut',false).where('idOwner',idOwner).then(function(dt){
					if(statusOrder[0]==null){
						knex.select('*').from('menukoki').where('idOwner',idOwner).then(function(menuKoki){
							knex.select('*').from('myorder').where({idOwner:idOwner,statusOrder : 'mengerjakan'}).then(function(myOrder){
								io.emit('trigerPembuatan',{triger:true})
								var koki = convert.convertKoki(menuKoki)
								var order = convert.convertOrder(myOrder)
								console.log(myOrder)
								var algo = algorithm.acoTabu(koki,order)
								for(var i=0;i<algo.length;i++){
									algo[i].idUser = JSON.stringify(algo[i].idUser)
									algo[i].waktuMasuk = new Date()
									algo[i].statusPengerjaan = ""
									algo[i].waktuSelesai = ""
								}
								knex.select('*').from('koki').where('idOwner',idOwner).then(function(myKoki){
									var index = 0
									var waktu = 0
									for(var i=0;i<myKoki.length;i++){
										var jumpa = false
										for(var j=0;j<algo.length;j++){
											if(myKoki[i].idKoki == algo[j].idKoki){
												if(jumpa==false){
													algo[j].statusPengerjaan = 'mengerjakan'
													waktuMasuk = new Date(Date.parse(algo[j].waktuMasuk))
													waktuSelesai = waktuMasuk.setMinutes(waktuMasuk.getMinutes()+algo[j].estimasi)
													detik = Math.floor(algo[j].estimasi)
													hasildetik = algo[j].estimasi - detik
													hasildetik*=60
													waktuSelesai = waktuMasuk.setSeconds(waktuMasuk.getSeconds()+hasildetik)
													waktuSelesai = new Date(waktuSelesai)
													waktu = JSON.parse(JSON.stringify(waktuSelesai))
													algo[j].waktuSelesai = waktuSelesai
													jumpa = true
												}
												else{
													algo[j].waktuMasuk = new Date(waktu)
													algo[j].waktuSelesai = new Date(waktu)
													algo[j].waktuSelesai.setMinutes(algo[j].waktuSelesai.getMinutes()+algo[j].estimasi)
													detik = Math.floor(algo[j].estimasi)
													hasildetik = algo[j].estimasi - detik
													hasildetik*=60
													algo[j].waktuSelesai.setSeconds(algo[j].waktuSelesai.getSeconds()+hasildetik)
													waktu = JSON.parse(JSON.stringify(algo[j].waktuSelesai))
													algo[j].statusPengerjaan = 'waiting'
												}
											}
										}
										waktu = 0
									}
									knex('pembuatan').insert(algo).then(function(myPembuatan){
									})
								})
							})
						})
					}
					else{
						knex.select('*').from('menuKoki').where('idOwner',idOwner).then(function(menuKoki){
							knex.select('*').from('koki').where('idOwner',idOwner).then(function(myKoki){
								knex.select('*').from('pembuatan').where('idOwner',idOwner).then(function(myPembuatan){
									for(var i=0;i<myKoki.length;i++){
										var waktuTerakhir = 0
										var isJumpa = false
										myKoki[i].minutes = 0
										for(var j=0;j<myPembuatan.length;j++){
											if(myKoki[i].idKoki==myPembuatan[j].idKoki){
												waktuTerakhir = new Date(Date.parse(myPembuatan[j].waktuSelesai))
												isJumpa = true
											}
										}
										if(isJumpa){
											now = new Date()
											selisih = waktuTerakhir-now
											if(selisih>0){
												minutes = Math.round(((selisih % 86400000) % 3600000) / 60000)
												myKoki[i].minutes = minutes
												for(var j=0;j<menuKoki.length;j++){
													if(menuKoki[j].idKoki ==myKoki[i].idKoki){
														menuKoki[j].estimasi+=minutes
													}
												}
											}
										}
										myKoki[i].waktuTerakhir = waktuTerakhir
									}
									knex.select("*").from('myorder').where({idOwner:idOwner,statusOrder : 'waiting'}).then(function(myOrder){
										var koki = convert.convertKoki(menuKoki)
										var order = convert.convertOrder(myOrder)
										var algo = algorithm.acoTabu(koki,order)
										for(var i=0;i<algo.length;i++){
											algo[i].idUser = JSON.stringify(algo[i].idUser)
											algo[i].waktuMasuk = new Date()
											algo[i].statusPengerjaan = ""
											algo[i].waktuSelesai = ""
										}
										for(var i=0;i<myKoki.length;i++){
											for(var j=0;j<algo.length;j++){
												if(algo[j].idKoki == myKoki[i].idKoki){
													algo[j].estimasi-=myKoki[i].minutes
												}
											}
										}

										var waktu = 0
										for(var i=0;i<myKoki.length;i++){
											var ada = false
											for(var j=0;j<myPembuatan.length;j++){
												if(myPembuatan[j].idKoki == myKoki[i].idKoki){
													ada = true
													for(var k=0;k<algo.length;k++){
														if(myKoki[i].idKoki==algo[k].idKoki){
															algo[k].statusPengerjaan='waiting'
														}
													}
												}
											}
											if(!ada){
												for(var k=0;k<algo.length;k++){
													var jumpa = false
													if(myKoki[i].idKoki==algo[k].idKoki){
														if(!jumpa){
															algo[k].statusPengerjaan = 'mengerjakan'
															jumpa = true
														}
														else{
															algo[k].statusPengerjaan = 'waiting'
														}
													}
												}
												waktu = 0
											}
										}
										knex('pembuatan').insert(algo).then(function(ev){
											knex('myorder').update('statusOrder','mengerjakan').where({idOwner:idOwner,statusOrder:'waiting'}).then(function(suc){
												io.emit('trigerPembuatan',{triger:true})
												knex.select('*').from('pembuatan').where({idOwner : idOwner}).then(function(dta){
													waktu = 0
													for(var i=0;i<myKoki.length;i++){
														for(var j=0;j<dta.length;j++){
															if(dta[j].idKoki==myKoki[i].idKoki){
																if(dta[j].waktuSelesai!='0000-00-00 00:00:00'){
																	waktu = JSON.parse(JSON.stringify(dta[j].waktuSelesai))
																}
																else if(dta[j].statusPengerjaan=='mengerjakan' && dta[j].waktuSelesai=='0000-00-00 00:00:00'){
																	waktuMasuk = new Date(Date.parse(dta[j].waktuMasuk))
																	waktuSelesai = waktuMasuk.setMinutes(waktuMasuk.getMinutes()+dta[j].estimasi)
																	detik = Math.floor(dta[j].estimasi)
																	hasildetik = dta[j].estimasi - detik
																	hasildetik*=60
																	waktuSelesai = waktuMasuk.setSeconds(waktuMasuk.getSeconds()+hasildetik)
																	waktuSelesai = new Date(waktuSelesai)
																	waktu = JSON.parse(JSON.stringify(waktuSelesai))
																	dta[j].waktuSelesai = waktuSelesai
																}
																else if(dta[j].statusPengerjaan=='waiting' && dta[j].waktuSelesai=='0000-00-00 00:00:00'){
																	dta[j].waktuMasuk = new Date(waktu)
																	dta[j].waktuSelesai = new Date(waktu)
																	dta[j].waktuSelesai.setMinutes(dta[j].waktuSelesai.getMinutes()+dta[j].estimasi)
																	detik = Math.floor(dta[j].estimasi)
																	hasildetik = dta[j].estimasi - detik
																	hasildetik*=60
																	waktuSelesai = waktuMasuk.setSeconds(waktuMasuk.getSeconds()+hasildetik)
																	waktu = JSON.parse(JSON.stringify(dta[j].waktuSelesai))
																}
															}
														}
														waktu = 0
													}
													for(var i=0;i<dta.length;i++){
														knex('pembuatan').update({waktuMasuk : dta[i].waktuMasuk,waktuSelesai : dta[i].waktuSelesai}).where('idPembuatan',dta[i].idPembuatan).then(function(ro){

														})
													}
												})
											})
										})
									})
								})
							})
						})
					}
				})
			})
		})
	})
}
app.post('/nextMenu',function(req,res){
	id = req.body
	idOwner = id.idOwner
	now = new Date()
	knex.select('*').from('pembuatan').where('idPembuatan',id.idPembuatan).then(function(selectPembuatan){
		selectPembuatan[0].idUser = JSON.parse(selectPembuatan[0].idUser)
		menusel = []
		for(var i=0;i<selectPembuatan[0].idUser.length;i++){
			menusel.push({idOwner : selectPembuatan[0].idOwner,nama : selectPembuatan[0].nama,estimasi : selectPembuatan[0].estimasi,noMeja: selectPembuatan[0].idUser[i].noMeja,qty : selectPembuatan[0].idUser[i].qty,idUser : selectPembuatan[0].idUser[i].idUser})
		}
		knex('menuselesai').insert(menusel).then(function(isSucc){
			io.emit('trigerSelesai'+idOwner)
			knex('pembuatan').where('idPembuatan',id.idPembuatan).del().then(function(succ){
				knex.select('*').from('pembuatan').where('statusPengerjaan','waiting').andWhere('idKoki',id.idKoki).then(function(ev){
					if(ev[0]!=undefined){
						knex('pembuatan').update({statusPengerjaan:'mengerjakan',waktuMasuk : now}).where('idPembuatan',ev[0].idPembuatan).then(function(success){
							knex.select('*').from('myorder').where({idOwner:idOwner,statusOrder:'mengerjakan'}).then(function(order){
								knex.select('*').from('pembuatan').where({idOwner:idOwner}).then(function(pembuatan){
									for(var i=0;i<order.length;i++){
										var istrue = false
										for(var j=0;j<pembuatan.length;j++){
											if(pembuatan[j].idOrder == order[i].idOrder){
												istrue=true
											}
										}
										if(!istrue){
											knex('myorder').update('statusOrder','selesai').where('idOrder',order[i].idOrder).then(function(ord){
												io.emit('trigerPembuatan',{triger:true})
												res.end('sukses')
											})
										}
										else{
											res.end('sukses')
										}
									}
									res.end('sukses')
								})
							})
						})
					}
					else{
						knex.select('*').from('myorder').where({idOwner:idOwner,statusOrder:'mengerjakan'}).then(function(order){
							knex.select('*').from('pembuatan').where({idOwner:idOwner}).then(function(pembuatan){
								for(var i=0;i<order.length;i++){
									var istrue = false
									for(var j=0;j<pembuatan.length;j++){
										if(pembuatan[j].idOrder == order[i].idOrder){
											istrue=true
										}
									}
									if(!istrue){
										knex('myorder').update('statusOrder','selesai').where('idOrder',order[i].idOrder).then(function(ord){
											io.emit('trigerPembuatan',{triger:true})
											res.end('sukses')
										})
									}
									else{
											res.end('sukses')
										}
								}
								res.end('sukses')
							})
						})
					}
				})
			})	
		})
	})
})

app.get('/',function(req,res){
	auth = req.session;
	if(auth.islog){
		var data = [];
		knex.select('*').from('menu').where('idOwner',auth.idOwner).then(function(menu){
			knex.select('*').from('jenis').where('idOwner',auth.idOwner).then(function(jenis){
				res.render('web/dashboard.html',{menu : menu,data : jenis,name : auth.name,idOwner : auth.idOwner})
			})
		})
	}
	else
		res.render('web/index.html')
})
app.get('/logout',function(req,res){
	// req.session.destroy(function (err) {
	// 	if(!err)
	// 		res.redirect('/');
	// })
	auth = req.session
	auth.islog = false
	res.redirect('/')
})
app.get('/restoran',function(req,res){
	auth = req.session
	if(auth.islog){
		knex.select("*").from("restoran").where('idOwner',auth.idOwner).then(function(ev){
			res.render('web/restoran.html',{idOwner : auth.idOwner,name : auth.name,resto : ev[0]})
		})
	}
})
app.get('/koki',function(req,res){
	auth = req.session
	if(auth.islog){
		knex.select("*").from('koki').where('idOwner',auth.idOwner).then(function(koki){
			knex.select("*").from('menuKoki').where('idOwner',auth.idOwner).then(function(menuKoki){
				knex.select('*').from('jenis').where('idOwner',auth.idOwner).then(function(menu){
					res.render('web/koki.html',{idOwner : auth.idOwner,name : auth.name, koki : koki,menuKoki : menuKoki, menuJenis : menu})
				})
			})
		})
	}
})
app.get('/meja',function(req,res){
	auth = req.session
	if(auth.islog){
		knex.select('*').from('meja').where('idOwner',auth.idOwner).then(function(meja){
			for(var i=0;i<meja.length;i++){
				meja[i].encryptMeja = encrypmeja.encrypt(meja[i].idMeja)
			}
			res.render('web/meja.html',{idOwner:auth.idOwner,name : auth.name,meja : meja})
		})
	}
})
app.post('/tambah-meja',function(req,res){
	auth = req.session
	data = req.body
	if(auth.islog){
		knex.select('*').from('meja').where({idOwner:auth.idOwner,namaMeja:data.meja}).then(function(resp){
			if(resp[0]==undefined){
				knex('meja').insert({namaMeja:data.meja,idOwner:auth.idOwner,isFull:false}).then(function(response){
					res.redirect('/meja')
				})
			}
			else{
				knex.select('*').from('meja').where('idOwner',auth.idOwner).then(function(meja){
					for(var i=0;i<meja.length;i++){
						meja[i].encryptMeja = encrypmeja.encrypt(meja[i].idMeja)
					}
					res.render('web/meja.html',{idOwner:auth.idOwner,name : auth.name,meja : meja,message:'Meja telah ada'})
				})
			}
		})
	}
})
app.post('/hapus-meja',function(req,res){
	auth = req.session
	data = req.body
	if(auth.islog){
		knex('meja').where({idMeja:data.idMeja,isFull: false}).del().then(function(response){
			res.send()
		})
	}
})
app.post('/hasilScan',function(req,res){
	data = req.body
	idMeja = encrypmeja.decrypt(data.text)
	knex.select('*').from('meja').where({idMeja : idMeja,idOwner : data.idOwner}).then(function(resp){
		if(resp[0]==undefined){
			res.json({status:false,text : 'No meja tidak valid'})
		}
		else{
			if(!resp[0].isFull){
				knex('meja').update({isFull:true,idUser : data.idUser}).where('idMeja',idMeja).then(function(updateMeja){
					res.json({status:true,noMeja:resp[0].namaMeja,idMeja : idMeja})
				})
			}
			else if(resp[0].isFull && resp[0].idUser==data.idUser){
				res.json({status:true,noMeja:resp[0].namaMeja,idMeja : idMeja})
			}
			else{
				res.json({status:false,text : 'status meja sedang digunakan'})
			}
		}
	})
})
app.get('/menuSelesai',function(req,res){
	auth = req.session
	if(auth.islog){
		knex('menuselesai').join('user','menuselesai.idUser','=','user.email').select('*').where('idOwner',auth.idOwner).then(function(resp){
			res.render('web/menuselesai.html',{order : resp,name : auth.name,idOwner : auth.idOwner})
		})
	}
})
app.post('/hapusMenuSelesai',function(req,res){
	idSelesai = req.body.idSelesai
	knex('menuSelesai').where('idSelesai',idSelesai).del().then(function(resp){
		res.send()
	})
})
app.get('/pembayaran',function(req,res){
	auth=req.session
	if(auth.islog){
		knex('myorder').join('user','myorder.idUser','=','user.email').select('*').where({idOwner:auth.idOwner,telahBayar:false}).then(function(row){
			for(var i=0;i<row.length;i++){
				row[i].data = JSON.parse(row[i].data)
			}
			res.render('web/pembayaran.html',{idOwner : auth.idOwner,name : auth.name,order : row})
		})
	}
})
app.post('/hapus-order',function(req,res){
	data = req.body
	auth = req.session
	knex('myorder').update('telahBayar',true).where('idOrder',data.idOrder).then(function(success){
		knex.select('*').from('myorder').where('idOrder',data.idOrder).then(function(myOrdr){
			knex('meja').update({isFull:false,idUser:''}).where('idMeja',myOrdr[0].idMeja).then(function(resp){
				io.emit('trigerPembuatan',{triger:true})
				io.emit('telahBayar'+auth.idOwner)
				res.send()
			})
		})
	})
})
app.get('/pembuatan',function(req,res){
	auth = req.session
	if(auth.islog){
		knex.select('name','email').from('user').then(function(user){
			knex('pembuatan').select('*').where('pembuatan.idOwner',auth.idOwner).then(function(data){
				knex.select('*').from('koki').where('idOwner',auth.idOwner).then(function(koki){
					for(var i=0;i<data.length;i++){
						data[i].idUser = JSON.parse(data[i].idUser)
						for(var j=0;j<data[i].idUser.length;j++){
							for(var k=0;k<user.length;k++){
								if(user[k].email==data[i].idUser[j].idUser){
									data[i].idUser[j].nama = user[k].name
								}
							}
						}
					}
					res.render('web/pembuatan.html',{name : auth.name,idOwner : auth.idOwner,data : data,koki : koki})
				})
			})
		})
	}
})
app.get('/pesanan-masuk',function(req,res){
	auth = req.session
	if(auth.islog){
		knex('myorder').join('user','myorder.idUser','=','user.email').select('*').where('idOwner',auth.idOwner).andWhere('myorder.telahBayar',false).then(function(order){
			for(var i=0;i<order.length;i++){
				order[i].data = JSON.parse(order[i].data)
			}
			// var result = algorithm.acoTabu()
			// console.log(result)
			res.render('web/pesanan-masuk.html',{name : auth.name, idOwner : auth.idOwner,order : order})
		})
	}
})


 app.post("/api/Upload", uploading.single('image'),function(req, res) {
 	auth = req.session;
 	var idOwner = auth.idOwner;
 	var path = req.file.filename
 	knex.select('imageName').from('restoran').where('idOwner',idOwner).then(function(rows){

 		if(rows[0].imageName!='')
 			fs.unlink('web/images/cover-restoran/'+rows[0].imageName)
 		knex('restoran').update('imageName',path).where('idOwner',idOwner).then(function(row){
	 		res.send(req.file)
	 	})
 	})
 });
 app.post("/menu/Upload", uploading.single('image'),function(req, res) {
 	auth = req.session;
 	var idOwner = auth.idOwner;
 	var path = req.file.filename
 	var id = auth.idMakanan
 	knex.select('*').from('jenis').where('idMakanan',id).then(function(rows){

 		if(rows[0].picture !='')
 			fs.unlink('web/images/cover-restoran/'+rows[0].picture)
 		knex('jenis').update('picture',path).where('idMakanan',id).then(function(row){
	 		res.send(req.file)
	 	})
 	})
 });

app.get('/cover-restoran/:file',function(req,res){
	res.sendFile(path.resolve('web/images/cover-restoran/'+req.params.file))
})

app.use(express.static(__dirname + '/web'));

app.post('/batalPesanan',function(req,res){
	auth = req.session
	idOrder  = req.body.idOrder
	knex.select('*').from('myorder').where('idOrder',idOrder).then(function(resp){
		knex('myorder').update({statusOrder:"batal",isAuth : false,status:'closed'}).where({idOrder : idOrder}).then(function(row){
			knex.select('*').from('myorder').where({idUser : resp[0].idUser,isAuth:true}).then(function(respon){
				if(respon[0]==undefined){
					knex('meja').update({isFull:false,idUser:''}).where('idMeja',resp[0].idMeja).then(function(gg){
						io.emit('telahBayar'+auth.idOwner)
						res.json({berhasilBatal : true})
					})
				}
				else{
					res.json({berhasilBatal : true})
				}
			})
			
		})
	})
	
})
app.post('/koki/:paramKoki',function(req,res){
	auth = req.session
	var data = req.body;
	if(req.params.paramKoki == "tambah-koki"){
		console.log(data)
		knex.select('*').from('koki').where('email',data.email).then(function(dta){
			if(dta[0]!=null){
				res.end('fail')
			}
			else{
				knex('koki').insert({namaKoki : data.name,idOwner : auth.idOwner,email : data.email,password : data.password}).then(function(rows){
					res.end("sukses")
				})
			}
		})
	}
	else if(req.params.paramKoki == "tambah-menuKoki"){
		knex('menuKoki').insert({nama : data.nama,idOwner : auth.idOwner, estimasi : data.estimasi,idMakanan : data.idMakanan,idKoki : data.idKoki}).then(function(rows){
			res.end("sukses")
		})
	}
	else if(req.params.paramKoki == "hapus-koki"){
		knex('menuKoki').where('idKoki',data.type).del().then(function(ev){
			knex('koki').where('idKoki',data.type).del().then(function(koki){
				res.end("sukses")
			})
		})
	}
	else if(req.params.paramKoki == "hapus-menuKoki"){
		knex('menuKoki').where('idMenuKoki',data.idMenuKoki).del().then(function(success){
			res.end('sukses')
		})
	}
})
app.post('/dashboard/:tambah',function(req,res){
	auth = req.session;
	var data = req.body
	if(req.params.tambah == "tambah-menu"){
		knex('menu').insert({namaMenu : data.name,idOwner : auth.idOwner}).then(function(rows){
	  		res.end("sukses")
	  	})
	}
	else if(req.params.tambah == "tambah-jenis"){
		auth = req.session
		knex('jenis').insert({idOwner : auth.idOwner,nama : data.nama,price:data.price,idMenu : data.type}).then(function(rows){
			auth.idMakanan = rows[0]
			res.end("sukses")
		})
	}
	else if(req.params.tambah  == "hapus-menu"){
		knex.select('*').from('jenis').where('idMenu',data.type).then(function(ev){
			knex('menu').where('idMenu',data.type).del().then(function(rows){
				knex('jenis').where('idMenu',data.type).del().then(function(row){
					Promise.all(ev.map(menu=>{
						return knex('menuKoki')
						.where('idMakanan',menu.idMakanan).del()
						.then(istrue=>{
							return istrue
						})
					})).then(response=>{
						res.send('sukses')
					})
				})
			})
		})
	}
	else if(req.params.tambah == "hapus-jenis"){
		knex('jenis').where('idMakanan',data.idMakanan).del().then(function(resp){
			knex('menuKoki').where('idMakanan',data.idMakanan).del().then(function(respKoki){
				res.send('sukses')
			})
		})
	}
	else if(req.params.tambah =="data-resto"){
		data.idOwner = auth.idOwner
		// upload(data.image, res, function(err) {
		//     if (err) {
		//         return res.end("Something went wrong!");
		//     }
		//     return res.end("File uploaded sucessfully!.");
		// });
		if(data.namaRestoran =='' || data.buka=='00:00:00'||data.tutup=='00:00:00'|| data.lat =='' ||data.lng==''){
			res.end('fail')
		}
		else{
			knex.select('*').from('restoran').where('idOwner',data.idOwner).then(function(stat){
				if(stat[0]==null){
					if(data.oldPass==undefined){
						knex('restoran').insert(data).then(function(rows){
							res.end("sukses")
						})
					}
					else if(data.oldPass!=undefined){
						knex.select('*').from('owner').where('idOwner',data.idOwner).then(function(owner){
							if(owner[0].password == oldPass){
								knex('owner').update('password',data.newPass).where('idOwner',auth.idOwner).then(function(succ){
									delete data.oldPass
									delete data.newPass
									knex('restoran').insert(data).then(function(rows){
										res.end("sukses")
									})
								})
							}
							else
								res.end('password salah')
						})
					}
				}
				else{
					if(data.oldPass==undefined)
						knex('restoran').update(data).where('idOwner',auth.idOwner).then(function(rows){
							res.end("sukses")
						})
					else if(data.oldPass!=undefined){
						knex.select('*').from('owner').where('idOwner',auth.idOwner).then(function(owner){
							if(owner[0].password == data.oldPass){
								knex('owner').update('password',data.newPass).where('idOwner',auth.idOwner).then(function(succ){
									delete data.oldPass
									delete data.newPass
									knex('restoran').update(data).where('idOwner',auth.idOwner).then(function(rows){
										res.end("sukses")
									})
								})
							}
							else
								res.end('password salah')
						})
					}
				}
			})
		}
	}
})
app.get('/search/:data',function(req,res){
	keywoard = req.params.data
	knex.select('*').from('restoran').where('namaRestoran','like','%'+keywoard+'%').andWhere('status','true').then(function(rows){
		var date = moment().format("HH:mm")
		var depan = []
		var belakang = []
		for(var i = 0 ; i<rows.length;i++){
			if(date>rows[i].buka && date<rows[i].tutup){
				rows[i].time = "buka"
				depan.push(rows[i])
			}
			else{
				rows[i].time = "tutup"
				belakang.push(rows[i])
			}
		}
		rows = depan.concat(belakang)
		res.json(rows)
	})
})

// io.on('connection', function(socket){
//   socket.on('chat message',function(msg){
//   	
//   })
// });
app.use(express.static(__dirname + '/webAdmin'));
app.get('/admin',function(req,res){
	auth = req.session
	if(auth.adminLog){
		knex('owner').join('restoran','owner.idOwner','=','restoran.idOwner').select('owner.name',
			'owner.email',
			'owner.validasi',
			'owner.idOwner',
			'restoran.namaRestoran','restoran.imageName','restoran.fotoPemilik').then(function(resto){
			res.render('webAdmin/admin.html',{data:resto})
		})
	}
	else{
		knex.select('name','email').from('admin').then(function(admin){
			res.render('webAdmin/login.html',{admin:admin[0]})
		})
	}
})

app.get('/pengujian',function(req,res){
	auth = req.session
	console.log('masuk')
	if(auth.adminLog){
		res.render('webAdmin/pengujian.html')
	}
})
app.get('/adminLogout',function(req,res){
	auth = req.session
	auth.adminLog = false
	res.redirect('/admin')
})
app.post('/adminLogin',function(req,res){
	auth = req.session
	data = req.body
	knex.select('*').from('admin').then(function(admin){
		if(admin[0].password==data.password){
			auth.adminLog = true
			auth.adminName = admin[0].name
			res.redirect('/admin')
		}
		else{
			res.render('webAdmin/login.html',{message : 'password yang anda masukkan salah'})
		}
	})
})
app.post('/validasiOwner',function(req,res){
	data = req.body
	knex('owner').update('validasi',data.validasi).where('idOwner',data.idOwner).then(function(response){
		res.end()
	})
})
app.get('/tampilanKoki',function(req,res){
	auth = req.session
	if(auth.loginKoki){
		knex.select('name','email').from('user').then(function(user){
			knex.select('*').from('koki').where('idKoki',auth.idKoki).then(function(koki){
				knex.select('*').from('pembuatan').where('idKoki',auth.idKoki).then(function(data){
					for(var i=0;i<data.length;i++){
						data[i].idUser = JSON.parse(data[i].idUser)
						for(var j=0;j<data[i].idUser.length;j++){
							for(var k=0;k<user.length;k++){
								if(user[k].email==data[i].idUser[j].idUser){
									data[i].idUser[j].nama = user[k].name
								}
							}
						}
					}
					res.render('web/dashboardKoki.html',{idOwner : koki[0].idOwner,namaKoki : auth.nama, idKoki : auth.idKoki, data : data})
				})
			})
		})
	}
	else{
		res.render('web/loginKoki.html')
	}
})
app.post('/login-koki',function(req,res){
	data = req.body
	auth = req.session
	knex.select('*').from('koki').where({email:data.email,password : data.password}).then(function(dataKoki){
		if(dataKoki[0]==undefined){
			res.render('web/loginKoki.html',{message:"email atau password salah"})
		}
		else{
			auth.idKoki = dataKoki[0].idKoki
			auth.nama = dataKoki[0].namaKoki
			auth.loginKoki = true
			res.redirect('/tampilanKoki')
		}
	})
})
app.get('/pengaturanKoki',function(req,res){
	auth = req.session
	if(auth.loginKoki){
		res.render('web/pengaturanKoki.html',{nama: auth.nama,idKoki : auth.idKoki})
	}
})
app.post('/gantiPassKoki',function(req,res){
	auth=req.session
	data = req.body
	if(auth.loginKoki){
		knex('koki').update('password',data.newPass).where({idKoki:auth.idKoki,password:data.oldPass}).then(function(resp){
			if(!resp){
				res.render('web/pengaturanKoki.html',{nama: auth.nama,idKoki : auth.idKoki,message:'Password lama tidak sesuai',type:'red'})
			}
			else{
				res.render('web/pengaturanKoki.html',{nama: auth.nama,idKoki : auth.idKoki,message:'Berhasil',type:'green'})
			}
		})
	}
})
app.get('/logoutKoki',function(req,res){
	auth = req.session
	auth.loginKoki = false
	res.redirect('/tampilanKoki')
})
app.use(express.static(__dirname + '/'));
app.get('/*',function(req,res){
	res.render('error.html');
})

http.listen(3000,function(){
	console.log("server running on 3000");
});

