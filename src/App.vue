<template>
  <div id="app">

    
<div class="row no-gutters">
 <div class="col-sm-3">
   <div class="p-3 mb-2 bg-dark text-white">
     <h3 class="text-center">口罩供需地圖</h3>
     <h5  class="text-center">{{nowTime}}</h5>
     <br>
   </div>
    <div class="toolbox">
    <div class="sticky-top bg-white shadow-sm p-2">
    <div class="form-group d-flex">
      <label for="cityName" class="mr-2 col-form-label text-right">縣市</label>
            <div class="flex-fill">
              <select id="cityName" class="form-control"
              v-model="select.city"  @change="select.area = '';  updatestore();removeMark()">
                <option value="">--select--</option>
                <!-- value 取值 = {{c.CityName}} 綁定-->
                <option :value="c.CityName"  v-for="c in cityName" :key="c.CityName">
                  {{c.CityName}}
                </option>
            </select>
            </div>
          </div>
          <div class="form-group d-flex">
          <label for="area" class="mr-2 col-form-label text-right">地區</label>
          <div class="flex-fill">
          <select id="area" class="form-control" v-model="select.area" @change="updatestore"> 
            <option value="">--請選擇地區--</option>
            <!-- find() 方法會回傳第一個滿足所提供之測試函式的元素值 -->
          <option :value="a.AreaName" v-for="a in cityName.find((city) => city.CityName === select.city).AreaList" :key="a.AreaName">
            {{a.AreaName}} 
          </option>
          </select>
        </div>
    </div>
       <p class="mb-0 small text-muted text-right">請先選擇區域才能查看</p>
 </div>

        <ul class="list-group" >
            <template v-for="(item,key) in data">
                    <a class="list-group-item text-left " v-if="item.properties.county === select.city && item.properties.town === select.area" :key="key" 
                    :class="{ 'highlight': item.properties.mask_adult || item.properties.mask_child, 'low': item.properties.mask_adult  == 0 }"
                    @click="penTo(item)">
                        <h4 class="text-left store"  @change="updatestore()">{{item.properties.name}}</h4> 
                      <a :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                      target="_blank" title="Google Map">
                      {{item.properties.address}}
                      </a>
                      <br>
                      <p class="mb-0">
                      成人口罩：{{item.properties.mask_adult}} | 兒童口罩：{{item.properties.mask_child}}
                      </p>
                      <h5 class="badge badge-info font-weight-bold " style="width: 15rem; margin:5px; font-size:1rem"> 更新: {{item.properties.updated}} </h5>
                    </a>
            </template>
        </ul>

 </div>
 </div>
    <div class="col-sm-9">
    <div id="map"></div>
 </div>
 
</div>
   <div style="background-color:gray; color:white" class="footer text-center">
     作品練習用/Mask_map by Eric Liao
    </div>



  </div>
</template>



<style lang="scss">
  @import 'bootstrap/scss/bootstrap';
#map {
 height: 100vh;
}
.highlight {
 background: #e9ffe3;
}
.toolbox {
 height: 100vh;
 overflow-y: auto;
 a {
 cursor: pointer;
 }
}

.highlight{
  background-color: #dcedc2 ;
  font-weight: 700;
}
.low{
  color: red;
  background-color: #ffaaa6;
  
}
.footer{
  height: 10vh;

}
.store:hover{
  color:#ff2e63;
  font-weight: 900;
}

</style>

<script>
import L from 'leaflet';
// cityName 寫死在JSON內
import cityName from './assets/cityName.json';

let osmMap = {};

//座標條件
const iconCofig={
  iconSize: [25, 41],
  iconAnchor: [12, 41], //座標與圖標將對齊
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};
// 座標顏色
const icons ={
    green : new L.icon({
      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      ...iconCofig,
    }),
    grey : new L.icon({
      iconUrl:'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      ...iconCofig,
    }),
  };

//變更icon 
const changeicons = {
  addMapMarker(x,y,properties){
    const icon = properties.mask_adult? icons.green : icons.grey
    L.marker([y,x],{
      icon,
    }).addTo(osmMap).bindPopup(
      `
       <br>
        <stronge>藥局名稱: ${properties.name}</stronge>
       <br>
        口罩數量：<stronge>成人/ ${properties.mask_adult} ， 兒童/${properties.mask_child}
        <br>
         <stronge>地址: <a href="https://www.google.com.tw/maps/place/${properties.address}">${properties.address}</a></stronge>
        <br>
        <stronge>地址: ${properties.phone}</stronge>
        <br>
        <stronge>更新時間為: ${properties.updated}</stronge>
        <br>
     `
    )
  },
  removeMapMark(){
    // eachLayer每個圖層mark
    osmMap.eachLayer((layer)=>{
      // L.M(大寫)arker
      // 如果layer 的圖層為L.Marker
      if(layer instanceof L.Marker){
        osmMap.removeLayer(layer)
      }
    })
  },
  penTo(x,y,properties){
    const icon = properties.mask_adult ? icons.green : icons.grey
    // new L.Latlng(新增經緯度) = Represents a geographical point with a certain latitude and longitude.
    osmMap.penTo(new L.Latlng(y,x)); 
    L.marker([y,x],{
      icon,
    }).addTo(osmMap).bindPopup(
      `
      口罩剩餘：<stronge>成人- ${properties.mask_adult}
        <stronge>藥局名稱: ${properties.name}</stronge>
     <br>
         <stronge>地址: <a href="https://www.google.com.tw/maps/place/${properties.address}">${properties.address}</a></stronge>
        <br>
        <stronge>地址: ${properties.phone}</stronge>
        <br>
        <stronge>口罩數量: ${properties.mask_adult}</stronge>
        <br>
        <stronge>更新時間為: ${properties.updated}</stronge>
        <br>
        `
     )
  }
}
console.log("l",L)


export default {
  name:'app',
  data(){
    return{
      data:[],
      cityName,
      osmMap:{},
      select : {
        city:'臺北市',
        area:'中山區',
      },
      day: true,
      updateTime:'None'
    }
  },
// 現在時間
   created(){
      this.nowTimes();
    },

  methods:{
       // 現在時間
    newDate(currentTime){
        let year = new Date(currentTime).getFullYear();
        let month = new Date(currentTime).getMonth() + 1 ;
        let date = new Date(currentTime).getDate();
        let hh   =new Date(currentTime).getHours();
        // 如果< 10分鐘  個位數前面必須加個"0"，其餘不需要
        let mm    =new Date(currentTime).getMinutes() < 10  ? "0" + new Date(currentTime).getMinutes(): new Date(currentTime).getMinutes();
        // let ss = new Date(currentTime).getSeconds()
       this.nowTime = year + '年' + month + '月' + date + "日"  + " " +hh+ ':'+ mm
      //取得時間
      // console.log(this.nowTime)
    },
    nowTimes(){
      this.newDate(new Date());
      setInterval(this.nowTimes,20*1000)  
    },
    // 
    updatestore(){
    const stores = this.data.filter( (store) => 
      {
        // 如果是 city 
        if(!this.select.area){
        //選擇切換中的city 
          return store.properties.county === this.select.city
        }
        //選擇切換中的area 
          return store.properties.town === this.select.area 
        }
     );
      stores.forEach((store)=>{
        // properties api 中藥局的物件資料
        // geometry 座標
        const {properties,geometry} = store;
        // 標記座標
      changeicons.addMapMarker(
        geometry.coordinates[0],
        geometry.coordinates[1],
        properties,
      );
      console.log(stores)
      });
      //penTo為跳至 stores[] 中的第一筆資料
      this.penTo(stores[0]);
    },

    removeMark(){
      // 指向宣告changeicons的方法removeMapMark()
      changeicons.removeMapMark()
    },
    penTo(store){
      const {properties,geometry} = store
      console.log(properties)
      osmMap.panTo([
      // item.geometry.coordinates 為座標 為 (x,y)
          geometry.coordinates[1],
          geometry.coordinates[0],
        ]);
    }
  },
  mounted(){
    // let data = [];
    //  url 藥局開源 API
    const url = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
    this.$http.get(url).then((response) => {
      // console.log(response.data)
      this.data = response.data.features
      console.log('data',this.data)
      this.updatestore()
    });
    // osmMap  在'map' id 中指向上片所宣告的 let osmMap = {};
    osmMap = L.map('map', {
      center: [25.03, 121.55],
      zoom: 20,
    });
      //標記 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}',
     {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
     }).addTo(osmMap);
    //  console.log('Outdata',data)
  },

}
</script>

