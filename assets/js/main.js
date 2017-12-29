// import json from '/assets/json/equpiment.json';
// console.log(json);
let VueObj = new Vue({
    el: "#app",
    data: {
        ge_base_url: 'http://services.runescape.com/m=itemdb_oldschool/',
        equipment_list: [],
        task_list: [],
    },

    created: function () {
        Vue.http.headers.common['Access-Control-Allow-Origin'] = '*';
        Vue.http.headers.common['Accept'] = '*/*';

        // Get template
        this.$http.get('./assets/json/equipment.json').then((data) => {
            let equipment = data.body;

            this.$http.get(this.ge_base_url + 'api/catalogue/detail.json?item=4714').then((price_data) => {
                console.log(price_data);
            });

            // for (let key in data.body) {
            //     this.$http.jsonp(this.ge_base_url + 'api/catalogue/detail.json?item=' + key).then((price_data) => {
            //         console.log(price_data);
            //     });
            // }
        });

        this.$http.get('./assets/json/tasks.json').then((data) => {
            this.task_list = data.body;
        });
    },
});