/*!
 * hsnLightBox - jQuery Eklentisi
 * version: 1.0 (06 Mart 2013, Salı)
 * @jQuery v1.6 ve üstü ile çalışmaktadır.
 *
 * Örneklere http://hsnayd.github.com/hsnLightBox/ adresinden  ulaşabilirsiniz.
 * Projeye Adresi : https://github.com/hsnayd/hsnLightBox 
 * Lisans: MIT ve GPL
 * 	* http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2012 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 */
(function($){
	//Degişkenleri Ayarla
	var imgRegExp = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i, swfRegExp = /[^\.]\.(swf)\s*$/i,seciliNesne = new Image(),ayarlar = {},obje,pencere={},nesne = {},galeri={},gal_res=[],rel,tmp,kaplama,yukleniyor,ileri,geri,kapat,cerceve,icerik,hataKodu,ekran = {},IE =  navigator.userAgent.match(/msie/i),
	//Ekran Boyutlarını Alalım
	ekran_boyutlari = function(){
		ekran = {
			genislik	: $(window).innerWidth(),
			yukseklik	: $(window).innerHeight() 
		}
	},
	basla = function(){
		$(document).unbind('keydown.fb');
		$(window).unbind("resize.fb");
		kaplama.css({
			'background-color' : ayarlar.apRengi,
			'opacity' : ayarlar.saydamlik
		}).fadeIn('slow');
		yukleniyor.show();
		yukleniyor.bind('click.fb',$.hsnLightBox.kapat);
		(ayarlar.kapatButonuGoster) ? kapat.show() : kapat.hide();
		//Nesne Tipi Belirle 
		nesne.hedef = $(obje).attr('href');
		if(ayarlar.nesneTipi!==false){ nesne.tipi = ayarlar.nesneTipi ;}
		else if(ayarlar.icerik){nesne.tipi = 'html';}
		else{
			if (nesne.hedef.match(imgRegExp)){nesne.tipi = 'image';}
			else if(nesne.hedef.match(swfRegExp)){nesne.tipi = 'swf';}
			else if($(obje).hasClass('hsn-iframe')){nesne.tipi = 'iframe';}
			else if(nesne.hedef.indexOf("#") === 0){nesne.tipi = 'inline';}
			else {nesne.tipi = 'ajax';}
		}
		icerik_olustur();
	},
	icerik_olustur = function(){
		ekran_boyutlari();
		galeri.durum = false;
		switch (nesne.tipi) {
			case 'image' :
			rel = $(obje).attr('rel') || '' ;
			if(rel && rel!=='' && rel!=='nofollow'){
				gal_res = [];
				$('a[rel='+rel+']').each(function(index, element) {
                    gal_res[index] = $(this).attr('href');
                });
				if(gal_res.length > 1){
					galeri.durum = true;
					nesne.index = $('a[rel='+rel+']').index(obje);
				}else{galeri.durum = false;}
			}else{galeri.durum = false;}
			seciliNesne = new Image();
			seciliNesne.onload = function(){resim_islemleri();}
			seciliNesne.src = nesne.hedef;
			break;
			case 'html':
			nesne.icerik = ayarlar.icerik;
			nesne_islemleri();
			break;
			case 'inline':
			nesne.icerik = $(nesne.hedef).parent().html()
			nesne_islemleri();
			break;
			case 'ajax':
			ajax_hazirla();
			break;
			case 'swf':
			var flash = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + ayarlar.nesneGenislik + '" height="' + ayarlar.nesneYukseklik + '"><param name="movie" value="' + nesne.hedef + '"></param>',
			emb = '' ;
				$.each(ayarlar.swf, function(ozellik,deger){
					flash += '<param name="' + ozellik + '" value="' + deger + '"></param>';
					emb += ' ' + ozellik + '="' + deger + '"';
				});
			flash += '<embed src="' + nesne.hedef + '" type="application/x-shockwave-flash" width="' + ayarlar.nesneGenislik + '" height="' + ayarlar.nesneYukseklik + '"' + emb + '></embed></object>';		
			nesne.icerik = flash;
			nesne_islemleri();
			break;
			case 'iframe':
			nesne.icerik = '<iframe id="hsnLightBox-iframe" style="width:'+ayarlar.nesneGenislik+'px; height:'+ayarlar.nesneYukseklik+'px;" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+(IE ? 'allowtransparency="true""' : '')+' src="'+nesne.hedef+'"></iframe>';
			nesne_islemleri();
			break;
			}
	},
	nesne_islemleri = function(){
		tmp.html(nesne.icerik);
		nesne.genislik = tmp.width();
		nesne.yukseklik = tmp.height();
		tmp.find('div').css({'width':'','height':''});
		nesne.icerik = tmp.html();
		tmp.empty();
		ekran_kontrol();
		pozisyon_belirle();
		icerik.is(":visible") ? resim_degistir() : pencere_ac();
	},
	resim_islemleri = function(){
	  if(galeri.durum===true){galeri_islemleri();}
	  nesne.genislik = seciliNesne.width;
	  nesne.yukseklik = seciliNesne.height;
	  tmp.empty();
	  ekran_kontrol();
	  nesne.icerik = '<img src="'+nesne.hedef+'" width="'+nesne.genislik+'" height="'+nesne.yukseklik+'"/>';
	  pozisyon_belirle()
	  icerik.is(":visible") ? resim_degistir() : pencere_ac();	
	},
	galeri_islemleri = function(){
		galeri.ileri = gal_res[nesne.index+1];
		galeri.geri = gal_res[nesne.index-1];
	},
	ekran_kontrol = function(){
		if(nesne.genislik >= ekran.genislik-200){
			nesne.genislik = ekran.genislik - 200;
			if(nesne.tipi==='image'){nesne.yukseklik = Math.ceil((nesne.yukseklik * nesne.genislik)/(nesne.genislik+200));}
		}
		if((nesne.yukseklik >= ekran.yukseklik) && (nesne.tipi==='image')){
			nesne.yukseklik = ekran.yukseklik - 125;
			nesne.genislik = Math.ceil((nesne.genislik * nesne.yukseklik)/(nesne.yukseklik+125));
		}
	},
	pozisyon_belirle = function(){
		if(ekran.yukseklik > nesne.yukseklik){
		  pencere.top = Math.ceil((ekran.yukseklik - nesne.yukseklik - ayarlar.padding*2)/2);
		  pencere.left = Math.ceil((ekran.genislik - nesne.genislik - ayarlar.padding*2)/2);
		  pencere.position = 'fixed';
		}
		else{
		  pencere.top ='100';
		  pencere.left=Math.ceil((ekran.genislik -nesne.genislik)/2);
		  pencere.position='absolute';
		}
	},
	pencere_ac = function(){
		$(cerceve).css({
			'position' : pencere.position,
			'top' : pencere.top+'px',
			'left' : pencere.left+'px',
			'width' : nesne.genislik+'px',
			'heigh' : 'auto',
			'padding': ayarlar.padding
		});
		$(icerik).css('height',nesne.yukseklik+'px');
		if(nesne.tipi!=='image'){$(icerik).css('overflow','auto')}
		if(galeri.durum===true && ayarlar.yonButonuGoster){yonlendirmeler();}
		$(cerceve).fadeIn('slow');
		icerik_yukle();	
	},
	resim_degistir = function(){
		$(icerik).find('img').fadeOut(250).queue(function(){
			$(icerik).empty();
			$(icerik).dequeue();
		});
		$(ileri).fadeOut(300);
		$(geri).fadeOut(300);
		$(kapat).fadeOut(200).delay(400).queue(function(){
			$(kapat).dequeue();
			yeni_pozisyon();
		});		
	},
	yeni_pozisyon = function(){
		$(cerceve).css({
			'position' : pencere.position,
			'heigh' : 'auto',
			'padding': ayarlar.padding
		});
		$(icerik).animate({
			'height' : nesne.yukseklik+'px'
		},ayarlar.animasyonSuresi);
		$(cerceve).animate({
			'top' : pencere.top+'px',
			'left' : pencere.left+'px',
			'width' : nesne.genislik+'px'
		},
		{duration: ayarlar.animasyonSuresi}).queue(function(){
			$(this).dequeue();
			icerik_yukle();
			if(ayarlar.kapatButonuGoster){kapat.fadeIn('fast');}
			if(galeri.durum===true && ayarlar.yonButonuGoster){yonlendirmeler();}
		});
	},
	icerik_yukle = function(){
		yukleniyor.hide();
		icerik.append(nesne.icerik);
		bitis();
	},
	ajax_hazirla = function(){
	$.ajax({
		type:'POST',
		url:nesne.hedef,
		data:ayarlar.ajaxVeri || {},
		dataType:ayarlar.ajaxDataType,
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			if ( XMLHttpRequest.status > 0 ) {
				hataKodu = XMLHttpRequest.status;
				console.log(XMLHttpRequest.status);
				error();
			}
		},
		success:function(sonuc){
				nesne.icerik = sonuc;
				nesne_islemleri();
		}
	});
	},
	error = function(){
		nesne.icerik = (hataKodu === 404) ? ayarlar.hataMesaji404 : ayarlar.hataMesaji+hataKodu;
		nesne_islemleri();
	},
	yonlendirmeler = function(){
		(galeri.ileri!= null) ? ileri.show() : ileri.hide(); 
		(galeri.geri!= null) ? geri.show() : geri.hide(); 
	},
	bitis = function(){
		$(window).bind("resize.fb", $.hsnLightBox.resize);
		kapat.bind('click.fb',$.hsnLightBox.kapat);
		kaplama.bind('click.fb',$.hsnLightBox.kapat);
		$(document).bind('keydown.fb',function(e){//Lightbox esc ye basinca kapatma fonk.
			if(e.keyCode==27){$.hsnLightBox.kapat();
			}else if (e.keyCode == 37 && galeri.durum) {
				e.preventDefault();
				$.hsnLightBox.geri();
			}else if (e.keyCode == 39 && galeri.durum) {
				e.preventDefault();
				$.hsnLightBox.ileri();
			}
		});
	}
	/*#######################################*/
	$.fn.hsnLightBox = function(ayar){
		 $(this).click(function(e) {
			e.preventDefault();
			//Ayarları Alalım
			ayarlar = $.extend({ 
				saydamlik 			:	0.5,
				apRengi 			:	'#000',
				icerik				:	null,
				nesneTipi 			: 	false,
				nesneGenislik		:	560,
				nesneYukseklik		:	340,
				ajaxVeri			: 	null,
				ajaxDataType		:	'html',
				hataMesaji404		:	'Sayfa bulunamadı !',
				hataMesaji			: 	'Bir hata oluştu ! Hata kodu : ',
				animasyonSuresi		:	500,
				padding				:	10,
				swf					: 	{wmode: 'transparent'},
				kapatButonuGoster	:	true,
				yonButonuGoster		: 	true
			},ayar);
			obje = this;
			basla();
		  });	
	}//Fonksiyon bitis tagı
	$.hsnLightBox = function(){
		/* Bu bölüm geliştirilecek !*/
		console.log('Lan')
	}
	$.hsnLightBox.deneme = function(){
		 return this.get(0).scrollWidth > this.innerWidth();
	}
	$.hsnLightBox.resize = function(){
		ekran_boyutlari();
		pozisyon_belirle();
		$(cerceve).css({
			'position' : pencere.position,
			'heigh' : 'auto'
		});
		$(cerceve).animate({
			'top' : pencere.top+'px',
			'left' : pencere.left+'px',
			'width' : nesne.genislik+'px'
		},
		{duration: 200});
	}
	$.hsnLightBox.kapat = function(){
		$(kaplama).fadeOut('slow');
    	$(icerik).empty().parent().fadeOut('fast');
		ileri.hide();
		geri.hide();
		$(window).unbind("resize.fb");
		kapat.unbind('resize.fb');
		kaplama.unbind('resize.fb');
		$(document).unbind('keydown.fb');
		yukleniyor.unbind('click.fb');
		yukleniyor.hide();
	}
	$.hsnLightBox.ileri = function(){
		if(nesne.index == gal_res.length-1){return;}
		nesne.index++;
		obje = $('a[rel='+rel+']').eq(nesne.index);
		basla();
	}
	$.hsnLightBox.geri = function(){
		if(nesne.index===0){return;}
		nesne.index--;
		obje = $('a[rel='+rel+']').eq(nesne.index);
		basla();
	}
	$.hsnLightBox.baslangic = function(){
		$('body').append(
			kaplama = $('<div id="hsnLightBox"></div>'),
			cerceve = $('<div id="hsnLightBox-icerik-cerceve"></div>'),
			tmp = $('<div id="hsnLightBox-Tmp"></div>'),
			yukleniyor = $('<div id="hsnLightBox-loading"></div>')
		);
		$(cerceve).append(
			ileri = $('<a id="hsnLightBox-ileri" href="#ileri"><span class="hsnLightBox-ileri-icon"></span></a>'),
			geri = $('<a id="hsnLightBox-geri" href="#geri"><span class="hsnLightBox-geri-icon"></span></a>'),
			kapat = $('<div id="hsnLightBox-kapat" title="Kapat"></div>'),
			icerik = $('<div id="hsnLightBox-icerik"></div>')
		);
		ileri.click(function(e) {
            e.preventDefault();
			$.hsnLightBox.ileri();
		});
		geri.click(function(e) {
            e.preventDefault();
			$.hsnLightBox.geri();
		});
	}
	$(document).ready(function() {
        $.hsnLightBox.baslangic();
    });
})(jQuery);