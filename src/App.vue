<template>
  <div id="app">

    
<div class="row no-gutters">
 <div class="col-sm-3">

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
            <template v-for="(item,key) in data" >
                    <a class="list-group-item text-left" v-if="item.properties.county === select.city && item.properties.town === select.area" :key="key" 
                    :class="{ 'highlight': item.properties.mask_adult || item.properties.mask_child, 'low': item.properties.mask_adult  == 0 }">
                        <h4 class="text-left">{{item.properties.name}}</h4> 
                      <a href="https://www.google.com.tw/maps/place/..."
                      target="_blank" title="Google Map">
                      {{item.properties.address}}
                      </a>
                      <br>
                      <p class="mb-0">
                      成人口罩：{{item.properties.mask_adult}} | 兒童口罩：{{item.properties.mask_child}}
                      </p>
                      <p class="badge badge-info font-weight-normal" style="width: 10rem;">更新: {{item.properties.updated}}</p>
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

</style>

<script>
import L from 'leaflet';
// cityName 寫死在JSON內
import cityName from './assets/cityName.json';

let osmMap = {};
console.log("l",L)
export default {
  name:'app',
  data(){
    return{
      data:[],
      cityName,
      select : {
        city:'臺北市',
        area:'中山區',
      },
    }
  },


  methods:{
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
        const {properties} = store;
        // 標記座標
        L.marker([
      // store.geometry.coordinates 為座標 為 (x,y)
          store.geometry.coordinates[1],
          store.geometry.coordinates[0],
          // bindPopup() 跳出顯示內容
        ]).addTo(osmMap).bindPopup(`
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
        `);
      console.log(stores)
      });
      //penTo為跳至 stores[] 中的第一筆資料
      this.penTo(stores[0]);
    },
    removeMark(){
      // eachLayer每個圖層
      osmMap.eachLayer((layer)=>{
        // L.M(大寫)arker
        // 如果layer 的圖層為L.Marker
        if(layer instanceof L.Marker){
          osmMap.removeLayer(layer)
        }
      })
    },
    penTo(item){
      const {properties,geometry} = item
      console.log(properties)
      osmMap.panTo([
      // store.geometry.coordinates 為座標 為 (x,y)
          geometry.coordinates[1],
          geometry.coordinates[0],
        ])
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
      zoom: 16
    });
      //標記 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}',
     {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
     }).addTo(osmMap);
    //  console.log('Outdata',data)
  },

}
</script>

